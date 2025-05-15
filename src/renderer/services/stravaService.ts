import { ipcRenderer } from 'electron';
import axios from 'axios';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

// Use localhost for the redirect URI
const REDIRECT_URI = 'http://localhost:5173/auth/strava/callback';

interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile_medium: string;
    profile: string;
  };
}

class StravaService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
    this.redirectUri = REDIRECT_URI;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      approval_prompt: 'force',
      scope: 'read,activity:read'
    });

    return `${STRAVA_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    return window.electron.ipcRenderer.invoke('exchange-strava-code', code);
  }

  async refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    console.log('Refreshing Strava token');
    const response = await window.electron.ipcRenderer.invoke('refresh-strava-token', refreshToken);
    console.log('Token refresh response:', {
      hasToken: !!response.access_token,
      expiresAt: response.expires_at
    });
    return response;
  }

  private async ensureValidToken(accessToken: string, refreshToken: string): Promise<string> {
    if (!refreshToken) {
      console.error('No refresh token available');
      throw new Error('No refresh token available');
    }

    // Check if token is expired (with 5 minute buffer)
    const tokenData = JSON.parse(localStorage.getItem('strava_token_data') || '{}');
    const expiresAt = tokenData.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    if (!expiresAt || now + 300 > expiresAt) {
      console.log('Access token expired or expiring soon, refreshing...');
      try {
        const newTokenData = await this.refreshToken(refreshToken);
        
        // Update localStorage
        localStorage.setItem('strava_access_token', newTokenData.access_token);
        localStorage.setItem('strava_token_data', JSON.stringify({
          access_token: newTokenData.access_token,
          refresh_token: newTokenData.refresh_token,
          expires_at: newTokenData.expires_at
        }));
        
        // Update the athlete data in localStorage if it exists
        const athlete = JSON.parse(localStorage.getItem('strava_athlete') || 'null');
        if (athlete) {
          localStorage.setItem('strava_athlete', JSON.stringify({
            ...athlete,
            ...newTokenData.athlete
          }));
        }
        
        return newTokenData.access_token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Clear all Strava data on refresh failure
        localStorage.removeItem('strava_access_token');
        localStorage.removeItem('strava_token_data');
        localStorage.removeItem('strava_athlete');
        throw error;
      }
    }
    
    return accessToken;
  }

  async getAthleteStats(accessToken: string, athleteId: number): Promise<any> {
    console.log('Fetching athlete stats for:', athleteId);
    const refreshToken = JSON.parse(localStorage.getItem('strava_token_data') || '{}').refresh_token;
    const validToken = await this.ensureValidToken(accessToken, refreshToken);
    
    const response = await fetch(`${STRAVA_API_URL}/athletes/${athleteId}/stats`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    const data = await response.json();
    console.log('Received athlete stats:', data);
    return data;
  }

  async getRecentActivities(accessToken: string, perPage: number = 10): Promise<any> {
    console.log('Fetching recent activities');
    const refreshToken = JSON.parse(localStorage.getItem('strava_token_data') || '{}').refresh_token;
    const validToken = await this.ensureValidToken(accessToken, refreshToken);
    
    const response = await fetch(`${STRAVA_API_URL}/athlete/activities?per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    const data = await response.json();
    console.log('Received recent activities:', data);
    return data;
  }

  async getActivityDetails(accessToken: string, activityId: number): Promise<any> {
    console.log('Fetching activity details for:', activityId);
    const refreshToken = JSON.parse(localStorage.getItem('strava_token_data') || '{}').refresh_token;
    const validToken = await this.ensureValidToken(accessToken, refreshToken);
    
    const response = await fetch(`${STRAVA_API_URL}/activities/${activityId}`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    const data = await response.json();
    console.log('Received activity details:', data);
    return data;
  }
}

export const stravaService = new StravaService(); 