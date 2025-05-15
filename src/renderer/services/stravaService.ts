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

  async getAthleteStats(accessToken: string, athleteId: number): Promise<any> {
    console.log('Fetching athlete stats for:', athleteId);
    const response = await fetch(`${STRAVA_API_URL}/athletes/${athleteId}/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    console.log('Received athlete stats:', data);
    return data;
  }

  async getRecentActivities(accessToken: string, perPage: number = 10): Promise<any> {
    console.log('Fetching recent activities');
    const response = await fetch(`${STRAVA_API_URL}/athlete/activities?per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    console.log('Received recent activities:', data);
    return data;
  }
}

export const stravaService = new StravaService(); 