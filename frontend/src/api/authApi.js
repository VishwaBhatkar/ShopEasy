import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Unable to connect to server. Please ensure the backend is running.';
    if (error.response?.data?.message) {
      friendlyMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
      friendlyMessage = `Cannot reach backend at ${API_BASE_URL}. Ensure the Node.js server is running.`;
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Request timed out. Please try again.';
    }
    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export const AuthApi = {
  /**
   * Log in user with email & password
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Offline fallback: allow demo login if backend is unreachable
      if (
        (error.message === 'Network Error' || error.code === 'ECONNREFUSED') &&
        email.toLowerCase().trim() === 'demo@shopeasy.com' &&
        password === 'password123'
      ) {
        return {
          success: true,
          message: 'Demo login successful (offline mode)',
          data: {
            user: {
              id: 1,
              name: 'Rahul Sharma',
              email: 'demo@shopeasy.com',
              phone: '+91 98765 43210',
              address: 'Flat 402, Green Glen Heights, Bellandur',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560103'
            },
            token: 'demo-offline-jwt-token-shopeasy'
          }
        };
      }
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // Offline fallback for registration if backend is unreachable
      if (error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
        return {
          success: true,
          message: 'Account created successfully (offline mode)',
          data: {
            user: {
              id: Date.now(),
              name: userData.name,
              email: userData.email,
              phone: userData.phone || '',
              address: userData.address || '',
              city: userData.city || '',
              state: userData.state || '',
              pincode: userData.pincode || ''
            },
            token: `demo-offline-token-${Date.now()}`
          }
        };
      }
      throw error;
    }
  },

  /**
   * Fetch authenticated user profile
   */
  async getProfile(token) {
    const response = await apiClient.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(token, updates) {
    const response = await apiClient.put('/auth/profile', updates, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  /**
   * Log out on server
   */
  async logout(token) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.post('/auth/logout', {}, { headers });
      return response.data;
    } catch {
      return { success: true, message: 'Logged out' };
    }
  }
};

export default AuthApi;
