"use strict";
const electron = require("electron");
const path = require("path");
const UNSPLASH_ACCESS_KEY = "bjNofz1Fzm6AJBDW22g27x4IfsNkUn3zHfzDHpuVH5Y";
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      sandbox: false
    }
  });
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:*",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "connect-src 'self' http://localhost:* ws://localhost:* https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com wss://*.firebaseio.com wss://*.firebase.com https://api.unsplash.com",
          "font-src 'self'",
          "worker-src 'self' blob:"
        ].join("; ")
      }
    });
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}
process.env.NODE_ENV = "development";
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("app:get-version", () => {
  return electron.app.getVersion();
});
electron.ipcMain.handle("search-unsplash", async (_, query) => {
  try {
    console.log("Main process: Searching Unsplash for:", query);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Unsplash API error:", errorData);
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Unsplash API response:", data);
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      console.log("Selected image URL:", imageUrl);
      return imageUrl;
    }
    console.log("No images found, using fallback");
    return "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  }
});
