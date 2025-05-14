import { contextBridge, ipcRenderer } from 'electron';

// Define the type for the electron API
interface ElectronAPI {
  getVersion: () => Promise<string>;
  searchUnsplash: (query: string) => Promise<string>;
  getStravaClientId: () => Promise<string>;
  getStravaClientSecret: () => Promise<string>;
  exchangeStravaCode: (code: string) => Promise<any>;
  refreshStravaToken: (refreshToken: string) => Promise<any>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    searchUnsplash: (query: string) => ipcRenderer.invoke('search-unsplash', query),
    // Strava methods
    getStravaClientId: () => ipcRenderer.invoke('get-strava-client-id'),
    getStravaClientSecret: () => ipcRenderer.invoke('get-strava-client-secret'),
    exchangeStravaCode: (code: string) => ipcRenderer.invoke('exchange-strava-code', code),
    refreshStravaToken: (refreshToken: string) => ipcRenderer.invoke('refresh-strava-token', refreshToken),
  } as ElectronAPI
);

// Log when the preload script is loaded
console.log('Preload script loaded, electron API exposed'); 