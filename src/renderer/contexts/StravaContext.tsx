import React, { createContext, useContext, useState, useEffect } from 'react';
import { stravaService } from '../services/stravaService';

interface StravaContextType {
  isAuthenticated: boolean;
  athlete: any | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
}

export const StravaContext = createContext<StravaContextType | undefined>(undefined);

const isElectron = () => {
  const hasElectron = window && window.electron;
  const hasIpcRenderer = window?.electron?.ipcRenderer;
  const hasInvoke = typeof window?.electron?.ipcRenderer?.invoke === 'function';
  
  console.log('Electron environment check:', {
    hasElectron,
    hasIpcRenderer,
    hasInvoke,
    electronKeys: window?.electron ? Object.keys(window.electron) : [],
    ipcRendererKeys: window?.electron?.ipcRenderer ? Object.keys(window.electron.ipcRenderer) : [],
    electronObject: window?.electron
  });
  
  return hasElectron;
};

export const StravaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [athlete, setAthlete] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isElectronAvailable, setIsElectronAvailable] = useState(false);

  // Check if we're in an Electron environment and if window.electron is available
  useEffect(() => {
    console.log('StravaProvider: Checking Electron availability');
    const checkElectron = () => {
      const hasElectron = window && window.electron;
      const hasIpcRenderer = window?.electron?.ipcRenderer;
      const hasInvoke = typeof window?.electron?.ipcRenderer?.invoke === 'function';
      const hasOn = typeof window?.electron?.ipcRenderer?.on === 'function';
      const hasRemoveListener = typeof window?.electron?.ipcRenderer?.removeListener === 'function';
      
      console.log('StravaProvider: Electron availability check:', {
        hasElectron,
        hasIpcRenderer,
        hasInvoke,
        hasOn,
        hasRemoveListener,
        electronKeys: window?.electron ? Object.keys(window.electron) : [],
        ipcRendererKeys: window?.electron?.ipcRenderer ? Object.keys(window.electron.ipcRenderer) : [],
        electronObject: window?.electron
      });

      if (hasElectron) {
        console.log('StravaProvider: Electron is available');
        setIsElectronAvailable(true);
      } else {
        console.log('StravaProvider: Electron is not available');
        setIsElectronAvailable(false);
      }
    };

    // Check immediately
    checkElectron();

    // Also check after a short delay to handle cases where window.electron is loaded asynchronously
    const timeoutId = setTimeout(checkElectron, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    console.log('StravaProvider: Component mounted');
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('strava_access_token');
    const storedAthlete = localStorage.getItem('strava_athlete');
    
    console.log('StravaProvider: Checking stored credentials:', {
      hasToken: !!storedToken,
      hasAthlete: !!storedAthlete
    });
    
    if (storedToken && storedAthlete) {
      console.log('StravaProvider: Found stored Strava credentials');
      setAccessToken(storedToken);
      setAthlete(JSON.parse(storedAthlete));
      setIsAuthenticated(true);
    }

    // Set up IPC listener for Strava callback
    if (window.electron?.ipcRenderer) {
      console.log('StravaProvider: Setting up IPC listener for Strava callback');
      const handleIpcCallback = async (_: any, data: { type: string; code: string }) => {
        console.log('StravaProvider: Received IPC callback:', data);
        if (data.type === 'strava-auth-callback') {
          try {
            console.log('StravaProvider: Processing Strava callback with code:', data.code);
            await handleAuthCallback(data.code);
            console.log('StravaProvider: Successfully authenticated with Strava');
          } catch (error) {
            console.error('StravaProvider: Error handling Strava callback:', error);
            // Don't call logout here, just show the error
            throw error;
          }
        }
      };

      // Use on instead of once since we have a linter error
      window.electron.ipcRenderer.on('strava-auth-callback', handleIpcCallback);
      console.log('StravaProvider: IPC listener for strava-auth-callback added');

      return () => {
        console.log('StravaProvider: Cleaning up IPC listener');
        window.electron.ipcRenderer.removeListener('strava-auth-callback', handleIpcCallback);
      };
    } else {
      console.error('StravaProvider: Electron IPC not available');
    }
  }, []);

  // Add a debug effect to log state changes
  useEffect(() => {
    console.log('StravaContext state updated:', {
      isAuthenticated,
      hasAthlete: !!athlete,
      hasAccessToken: !!accessToken,
      athleteId: athlete?.id,
      athleteName: athlete ? `${athlete.firstname} ${athlete.lastname}` : null
    });
  }, [isAuthenticated, athlete, accessToken]);

  const login = () => {
    if (!isElectronAvailable) {
      console.error('Cannot login - Electron IPC not available');
      return;
    }

    console.log('Initiating Strava login');
    const authUrl = stravaService.getAuthUrl();
    console.log('Auth URL:', authUrl);
    
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      'Strava Authorization',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
    );

    if (!popup) {
      console.error('Failed to open popup window');
      return;
    }

    // Log that we're waiting for the callback
    console.log('Waiting for Strava callback...');
  };

  const logout = () => {
    console.log('Logging out from Strava');
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_athlete');
    setAccessToken(null);
    setAthlete(null);
    setIsAuthenticated(false);
  };

  const handleAuthCallback = async (code: string) => {
    console.log('Handling auth callback with code:', code);
    try {
      if (!isElectronAvailable || !window.electron?.ipcRenderer) {
        throw new Error('Electron IPC not available');
      }

      console.log('Sending auth code to main process');
      const response = await window.electron.ipcRenderer.invoke('exchange-strava-code', code);
      console.log('Received token response:', response);
      
      const { access_token, athlete, expires_at, refresh_token } = response;
      console.log('Extracted token and athlete data:', {
        hasToken: !!access_token,
        athleteId: athlete?.id,
        athleteName: `${athlete?.firstname} ${athlete?.lastname}`,
        expiresAt: expires_at
      });
      
      localStorage.setItem('strava_access_token', access_token);
      localStorage.setItem('strava_athlete', JSON.stringify(athlete));
      localStorage.setItem('strava_token_data', JSON.stringify({
        access_token,
        refresh_token,
        expires_at
      }));
      
      console.log('Updating state with new auth data');
      setAccessToken(access_token);
      setAthlete(athlete);
      setIsAuthenticated(true);
      console.log('Successfully authenticated with Strava');
    } catch (error) {
      console.error('Error during Strava authentication:', error);
      logout();
      throw error;
    }
  };

  return (
    <StravaContext.Provider
      value={{
        isAuthenticated,
        athlete,
        accessToken,
        login,
        logout,
        handleAuthCallback,
      }}
    >
      {children}
    </StravaContext.Provider>
  );
};

export const useStrava = () => {
  const context = useContext(StravaContext);
  if (context === undefined) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
}; 