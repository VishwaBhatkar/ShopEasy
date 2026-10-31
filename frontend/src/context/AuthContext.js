import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthApi from '../api/authApi';

const AUTH_USER_KEY = '@shopeasy_auth_user_v1';
const AUTH_TOKEN_KEY = '@shopeasy_auth_token_v1';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 1. Restore auth state on application startup
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [savedUserJson, savedToken] = await Promise.all([
          AsyncStorage.getItem(AUTH_USER_KEY),
          AsyncStorage.getItem(AUTH_TOKEN_KEY)
        ]);

        if (savedUserJson && savedToken) {
          const parsedUser = JSON.parse(savedUserJson);
          setUser(parsedUser);
          setToken(savedToken);

          // Verify with backend silently in background if online
          AuthApi.getProfile(savedToken)
            .then((res) => {
              if (res && res.data) {
                setUser(res.data);
                AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
              }
            })
            .catch(() => {
              // Ignore background sync errors if offline
            });
        }
      } catch (err) {
        console.warn('Failed to restore authentication state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  /**
   * Log in user with credentials
   */
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await AuthApi.login(email, password);
      if (response && response.success && response.data) {
        const { user: loggedInUser, token: authToken } = response.data;
        setUser(loggedInUser);
        setToken(authToken);

        await Promise.all([
          AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedInUser)),
          AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken)
        ]);

        return { success: true, message: response.message };
      }
      const message = response?.message || 'Login failed';
      setAuthError(message);
      return { success: false, error: message };
    } catch (err) {
      const errorMsg = err.friendlyMessage || err.response?.data?.message || err.message || 'Login failed';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await AuthApi.register(userData);
      if (response && response.success && response.data) {
        const { user: newUser, token: authToken } = response.data;
        setUser(newUser);
        setToken(authToken);

        await Promise.all([
          AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser)),
          AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken)
        ]);

        return { success: true, message: response.message };
      }
      const message = response?.message || 'Registration failed';
      setAuthError(message);
      return { success: false, error: message };
    } catch (err) {
      const errorMsg = err.friendlyMessage || err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Log out user and clear storage
   */
  const logout = async () => {
    try {
      if (token) {
        await AuthApi.logout(token).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      setAuthError(null);
      try {
        await Promise.all([
          AsyncStorage.removeItem(AUTH_USER_KEY),
          AsyncStorage.removeItem(AUTH_TOKEN_KEY)
        ]);
      } catch (err) {
        console.warn('Error clearing auth from storage:', err);
      }
    }
    return { success: true };
  };

  /**
   * Update profile
   */
  const updateProfile = async (updates) => {
    try {
      if (!token) throw new Error('Not logged in');
      const response = await AuthApi.updateProfile(token, updates);
      if (response && response.success && response.data) {
        setUser(response.data);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data));
        return { success: true, user: response.data };
      }
      return { success: false, error: response?.message || 'Update failed' };
    } catch (err) {
      const errorMsg = err.friendlyMessage || err.response?.data?.message || err.message || 'Update failed';
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    authError,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
