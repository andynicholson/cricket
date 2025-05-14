"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld(
  "electron",
  {
    getVersion: () => electron.ipcRenderer.invoke("app:get-version")
    // Add more IPC methods here as needed
  }
);
