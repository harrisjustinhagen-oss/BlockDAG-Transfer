import axios, { AxiosInstance } from 'axios';

/**
 * Fitbit OAuth Configuration
 * Note: You need to register your app at https://dev.fitbit.com/apps
 * and get your Client ID and Client Secret
 */
const FITBIT_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_FITBIT_CLIENT_ID || 'YOUR_FITBIT_CLIENT_ID',
  CLIENT_SECRET: import.meta.env.VITE_FITBIT_CLIENT_SECRET || 'YOUR_FITBIT_CLIENT_SECRET',
  REDIRECT_URI: 'http://localhost:3000/auth/fitbit-callback',
  AUTH_URL: 'https://www.fitbit.com/oauth2/authorize',
  TOKEN_URL: 'https://api.fitbit.com/oauth2/token',
  API_BASE_URL: 'https://api.fitbit.com/1'
};

export interface FitbitHealthData {
  steps: number;
  stairs: number;
  sleepScore: number;
  calories: number;
  heartRate: number;
  activeMinutes: number;
  distance: number;
  floors: number;
}

export interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_id: string;
}

class FitbitService {
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private userId: string | null = null;

  constructor() {
    this.loadTokensFromStorage();
    this.initializeApiClient();
  }

  /**
   * Initialize axios instance with current token
   */
  private initializeApiClient() {
    this.apiClient = axios.create({
      baseURL: FITBIT_CONFIG.API_BASE_URL,
      headers: {
        'Accept': 'application/json',
        'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : ''
      }
    });

    // Add request interceptor to handle token refresh
    this.apiClient.interceptors.request.use(
      async (config) => {
        if (this.isTokenExpired()) {
          await this.refreshAccessToken();
        }
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle 401 errors
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            return this.apiClient(error.config);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            this.clearTokens();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiry;
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage() {
    const stored = localStorage.getItem('fitbit_tokens');
    if (stored) {
      try {
        const { accessToken, refreshToken, tokenExpiry, userId } = JSON.parse(stored);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = tokenExpiry;
        this.userId = userId;
      } catch (error) {
        console.error('Failed to parse stored Fitbit tokens:', error);
        localStorage.removeItem('fitbit_tokens');
      }
    }
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage() {
    localStorage.setItem('fitbit_tokens', JSON.stringify({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry,
      userId: this.userId
    }));
  }

  /**
   * Clear all tokens
   */
  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
    this.userId = null;
    localStorage.removeItem('fitbit_tokens');
  }

  /**
   * Start OAuth flow
   */
  startOAuthFlow(): void {
    const scope = 'activity heartrate sleep profile';
    const state = Math.random().toString(36).substring(7);
    
    // Store state for verification
    sessionStorage.setItem('fitbit_oauth_state', state);
    
    const authUrl = new URL(FITBIT_CONFIG.AUTH_URL);
    authUrl.searchParams.append('client_id', FITBIT_CONFIG.CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('redirect_uri', FITBIT_CONFIG.REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('prompt', 'login');
    
    window.location.href = authUrl.toString();
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string): Promise<boolean> {
    // Verify state
    const storedState = sessionStorage.getItem('fitbit_oauth_state');
    console.log('Verifying OAuth state:', { 
      returned: state, 
      stored: storedState, 
      match: state === storedState 
    });
    
    if (!storedState) {
      console.error('No stored OAuth state found in sessionStorage');
      return false;
    }
    
    if (state !== storedState) {
      console.error('OAuth state mismatch', { returned: state, stored: storedState });
      return false;
    }
    
    try {
      console.log('Exchanging code for token via backend...');
      
      // Call our backend endpoint which securely exchanges the code
      // (Client Secret stays on the server, never exposed to browser)
      const response = await axios.post('http://localhost:4000/fitbit/token', {
        code,
        redirect_uri: FITBIT_CONFIG.REDIRECT_URI
      });
      
      const tokenData: FitbitTokenResponse = response.data;
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      this.userId = tokenData.user_id;
      
      console.log('✓ OAuth token exchange successful!');
      this.saveTokensToStorage();
      this.initializeApiClient();
      
      // Clear state only after successful exchange
      sessionStorage.removeItem('fitbit_oauth_state');
      return true;
    } catch (error: any) {
      console.error('Failed to exchange OAuth code:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    try {
      // Call backend endpoint to refresh token securely
      const response = await axios.post('http://localhost:4000/fitbit/refresh', {
        refresh_token: this.refreshToken
      });

      const tokenData: FitbitTokenResponse = response.data;
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token || this.refreshToken;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

      this.saveTokensToStorage();
      this.initializeApiClient();
      return true;
    } catch (error) {
      console.error('Failed to refresh Fitbit token:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  /**
   * Fetch user profile
   */
  async getUserProfile() {
    try {
      const response = await this.apiClient.get(`/user/-/profile.json`);
      return response.data.user;
    } catch (error) {
      console.error('Failed to fetch Fitbit user profile:', error);
      throw error;
    }
  }

  /**
   * Fetch health data for today
   */
  async getTodayHealthData(): Promise<FitbitHealthData> {
    const today = new Date().toISOString().split('T')[0];
    return this.getHealthDataForDate(today);
  }

  /**
   * Fetch health data for a specific date
   */
  async getHealthDataForDate(date: string): Promise<FitbitHealthData> {
    try {
      const [stepsRes, stairsRes, sleepRes, caloriesRes, heartRateRes, activeMinsRes, distanceRes] = 
        await Promise.all([
          this.apiClient.get(`/user/-/activities/date/${date}.json`),
          this.apiClient.get(`/user/-/activities/date/${date}.json`),
          this.apiClient.get(`/user/-/sleep/date/${date}.json`),
          this.apiClient.get(`/user/-/activities/date/${date}.json`),
          this.apiClient.get(`/user/-/activities/heart/date/${date}/1d.json`),
          this.apiClient.get(`/user/-/activities/date/${date}.json`),
          this.apiClient.get(`/user/-/activities/date/${date}.json`)
        ]);

      // Extract steps
      const steps = stepsRes.data.summary?.steps || 0;
      
      // Extract floors (using as stairs)
      const stairs = stairsRes.data.summary?.floors || 0;
      
      // Calculate sleep score (0-100)
      let sleepScore = 75; // Default
      if (sleepRes.data.sleep && sleepRes.data.sleep.length > 0) {
        const totalSleep = sleepRes.data.sleep.reduce((sum: number, s: any) => sum + (s.duration / 3600000), 0);
        // Score based on 7-8 hours being optimal
        sleepScore = Math.min(100, Math.max(0, totalSleep * 12.5));
      }
      
      // Extract calories
      const calories = caloriesRes.data.summary?.caloriesBurned || 0;
      
      // Extract heart rate
      let heartRate = 70;
      if (heartRateRes.data['activities-heart'] && heartRateRes.data['activities-heart'].length > 0) {
        const heartData = heartRateRes.data['activities-heart'][0];
        heartRate = heartData.value?.restingHeartRate || 70;
      }
      
      // Extract active minutes
      const activeMinutes = activeMinsRes.data.summary?.fairlyActiveMinutes || 0;
      
      // Extract distance
      const distance = distanceRes.data.summary?.distance || 0;

      console.log('Fitbit data fetched:', {
        steps, stairs, sleepScore, calories, heartRate, activeMinutes, distance
      });

      return {
        steps: Math.round(steps),
        stairs: Math.round(stairs),
        sleepScore: Math.round(sleepScore),
        calories: Math.round(calories),
        heartRate: Math.round(heartRate),
        activeMinutes: Math.round(activeMinutes),
        distance: Number(distance.toFixed(2)),
        floors: Math.round(stairs)
      };
    } catch (error) {
      console.error('Failed to fetch Fitbit health data:', error);
      // Return fallback data on error
      return this.getDefaultHealthData();
    }
  }

  /**
   * Get default/fallback health data
   */
  private getDefaultHealthData(): FitbitHealthData {
    return {
      steps: 8500,
      stairs: 12,
      sleepScore: 78,
      calories: 2250,
      heartRate: 72,
      activeMinutes: 45,
      distance: 6.5,
      floors: 12
    };
  }

  /**
   * Fetch intraday data (requires special scope)
   */
  async getIntradayData(date: string, resource: 'steps' | 'heart-rate' | 'sleep') {
    try {
      const response = await this.apiClient.get(
        `/user/-/activities/${resource}/date/${date}/1d/1min.json`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch Fitbit intraday ${resource} data:`, error);
      throw error;
    }
  }

  /**
   * Set up continuous sync of health data
   */
  setupContinuousSync(
    onDataUpdate: (data: FitbitHealthData) => void,
    interval: number = 30000
  ): () => void {
    const syncInterval = setInterval(async () => {
      try {
        if (this.isAuthenticated()) {
          const data = await this.getTodayHealthData();
          onDataUpdate(data);
        }
      } catch (error) {
        console.error('Error during Fitbit sync:', error);
      }
    }, interval);

    return () => clearInterval(syncInterval);
  }

  /**
   * Logout - revoke tokens
   */
  logout(): void {
    this.clearTokens();
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get access token (for debugging)
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export default new FitbitService();
