import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    // Add more IPC methods here as needed
  }
); 