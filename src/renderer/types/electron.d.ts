interface ElectronAPI {
  getVersion: () => Promise<string>;
  searchUnsplash: (query: string) => Promise<string>;
  ipcRenderer: {
    on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
    removeListener: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 