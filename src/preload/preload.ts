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
contextBridge.exposeInMainWorld('electron', {
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  searchUnsplash: (query: string) => ipcRenderer.invoke('search-unsplash', query),
  ipcRenderer: {
    on: (channel: string, callback: (event: any, ...args: any[]) => void) => {
      ipcRenderer.on(channel, callback);
    },
    once: (channel: string, callback: (event: any, ...args: any[]) => void) => {
      ipcRenderer.once(channel, callback);
    },
    removeListener: (channel: string, callback: (event: any, ...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, callback);
    },
    invoke: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args);
    }
  }
});

// Log when the preload script is loaded
console.log('Preload script loaded, electron API exposed'); 