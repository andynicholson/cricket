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
  { 
    scheme: 'cricket', 
    privileges: { 
      secure: true, 
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true
    } 
  }
]);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      webSecurity: true
    }
  });

  // Set Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* https://*.strava.com",
    "style-src 'self' 'unsafe-inline' https://*.strava.com",
    "img-src 'self' data: https://images.unsplash.com https://dgalywyr863hv.cloudfront.net https://*.cloudfront.net https://*.strava.com",
    "connect-src 'self' http://localhost:* ws://localhost:* https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com wss://*.firebaseio.com wss://*.firebase.com https://api.unsplash.com https://www.strava.com https://api.strava.com https://*.strava.com",
    "font-src 'self' https://*.strava.com",
    "worker-src 'self' blob:"
  ].join('; ');

  console.log('Setting CSP:', csp);

  // Set CSP for all requests
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    //console.log('Headers received for:', details.url);
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });

  // Also set CSP for the main window's session
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    //console.log('Permission requested:', permission);
    callback(true);
  });

  // Also log when the window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Main window loaded');
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

  return mainWindow;
}

// Handle Strava callback in popup windows
function handleStravaCallback(window: BrowserWindow, url: string) {
  console.log('Handling Strava callback in window:', window.getTitle());
  const urlObj = new URL(url);
  const code = urlObj.searchParams.get('code');
  
  if (code) {
    console.log('Strava callback received with code:', code);
    // Find the main window
    const allWindows = BrowserWindow.getAllWindows();
    console.log('All windows:', allWindows.map(w => w.getTitle()));
    
    // Find the main window (the one that's not the popup)
    const mainWindow = allWindows.find(w => w !== window);
    
    if (mainWindow) {
      console.log('Found main window:', mainWindow.getTitle());
      console.log('Sending auth code to main window');
      // Send the auth code to the main window
      mainWindow.webContents.send('strava-auth-callback', { type: 'strava-auth-callback', code });
      console.log('Auth code sent to main window');
    } else {
      console.error('Could not find main window');
    }
    
    // Close the popup window
    window.close();
    console.log('Closed popup window');
  }
}

app.whenReady().then(() => {
  const mainWindow = createWindow();
  mainWindow.setTitle('Cricket');
  console.log('Main window created with title:', mainWindow.getTitle());

  // Store the main window reference
  let mainWindowRef = mainWindow;

  // Handle navigation in all windows
  app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, url) => {
      console.log('Navigation detected:', url);
      if (url.includes('/auth/strava/callback')) {
        // Prevent the default navigation
        event.preventDefault();
        
        // Handle the callback
        const window = BrowserWindow.fromWebContents(contents);
        if (window) {
          handleStravaCallback(window, url);
        } else {
          console.error('Could not find window for contents');
        }
      }
    });

    // Also handle the callback when the URL changes
    contents.on('did-navigate', (event, url) => {
      console.log('Navigation completed:', url);
      if (url.includes('/auth/strava/callback')) {
        const window = BrowserWindow.fromWebContents(contents);
        if (window) {
          handleStravaCallback(window, url);
        } else {
          console.error('Could not find window for contents');
        }
      }
    });
  });

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
  console.log('Main process: Exchanging Strava code for token');
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID!,
    client_secret: STRAVA_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:5173/auth/strava/callback'
  });

  try {
    console.log('Main process: Making request to Strava token endpoint with params:', params.toString());
    const response = await axios.post(STRAVA_TOKEN_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.status !== 200) {
      console.error('Main process: Unexpected response status:', response.status);
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    console.log('Main process: Successfully exchanged code for token');
    console.log('Main process: Token response:', {
      hasToken: !!response.data.access_token,
      athleteId: response.data.athlete?.id,
      athleteName: `${response.data.athlete?.firstname} ${response.data.athlete?.lastname}`
    });
    return response.data;
  } catch (error) {
    console.error('Main process: Error exchanging code for token:', error);
    if (axios.isAxiosError(error)) {
      console.error('Main process: Strava API error details:', {
        status: error.response?.status,
        data: error.response?.data
      });
      // Throw a more descriptive error
      throw new Error(`Strava API error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
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