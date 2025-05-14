import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const UNSPLASH_ACCESS_KEY = 'bjNofz1Fzm6AJBDW22g27x4IfsNkUn3zHfzDHpuVH5Y';
const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

// These should be stored securely in production
const STRAVA_CLIENT_ID = process.env.NODE_ENV === 'development'
  ? process.env.VITE_STRAVA_CLIENT_ID
  : process.env.STRAVA_CLIENT_ID;

const STRAVA_CLIENT_SECRET = process.env.NODE_ENV === 'development'
  ? process.env.VITE_STRAVA_CLIENT_SECRET
  : process.env.STRAVA_CLIENT_SECRET;

// Validate required environment variables
if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
  console.error('Missing required Strava environment variables:');
  console.error('Client ID:', STRAVA_CLIENT_ID ? '✓' : '✗');
  console.error('Client Secret:', STRAVA_CLIENT_SECRET ? '✗' : '✗');
  throw new Error('Missing required Strava environment variables. Please check your configuration.');
}

// Register custom protocol before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'cricket', privileges: { secure: true, standard: true } }
]);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* https://*.strava.com",
          "style-src 'self' 'unsafe-inline' https://*.strava.com",
          "img-src 'self' data: https: https://*.strava.com",
          "connect-src 'self' http://localhost:* ws://localhost:* https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com wss://*.firebaseio.com wss://*.firebase.com https://api.unsplash.com https://www.strava.com https://api.strava.com https://*.strava.com",
          "font-src 'self' https://*.strava.com",
          "worker-src 'self' blob:"
        ].join('; ')
      }
    });
  });

  // Handle custom protocol
  protocol.handle('cricket', (request) => {
    const url = new URL(request.url);
    if (url.pathname === '/auth/strava/callback') {
      const code = url.searchParams.get('code');
      if (code) {
        // Send the code to all windows
        BrowserWindow.getAllWindows().forEach(window => {
          window.webContents.send('strava-auth-callback', { type: 'strava-auth-callback', code });
        });
      }
    }
    return new Response(null, { status: 200 });
  });

  // Load the index.html file
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Open DevTools only if explicitly enabled
  if (process.env.OPEN_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools();
  }
}

// Remove forced development mode
// process.env.NODE_ENV = 'development';

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('search-unsplash', async (_, query: string) => {
  try {
    console.log('Main process: Searching Unsplash for:', query);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Unsplash API error:', errorData);
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Unsplash API response:', data);
    
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      console.log('Selected image URL:', imageUrl);
      return imageUrl;
    }
    
    console.log('No images found, using fallback');
    return 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  }
});

// IPC Handlers
ipcMain.handle('get-strava-client-id', () => STRAVA_CLIENT_ID);
ipcMain.handle('get-strava-client-secret', () => STRAVA_CLIENT_SECRET);

ipcMain.handle('exchange-strava-code', async (_, code: string) => {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID!,
    client_secret: STRAVA_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
  });

  const response = await axios.post(STRAVA_TOKEN_URL, params);
  return response.data;
});

ipcMain.handle('refresh-strava-token', async (_, refreshToken: string) => {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID!,
    client_secret: STRAVA_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await axios.post(STRAVA_TOKEN_URL, params);
  return response.data;
}); 