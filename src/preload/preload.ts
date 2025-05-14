import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    searchUnsplash: (query: string) => ipcRenderer.invoke('search-unsplash', query)
  }
);

// Log when the preload script is loaded
console.log('Preload script loaded, electron API exposed'); 