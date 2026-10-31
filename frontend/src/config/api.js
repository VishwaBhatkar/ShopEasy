import { Platform } from 'react-native';

/**
 * Global API Configuration
 * 
 * - In React Native Web / iOS Simulator: http://localhost:5000/api
 * - In Android Emulator: http://10.0.2.2:5000/api
 * - On Physical Device: Change to your machine's Wi-Fi LAN IP e.g. http://192.168.1.5:5000/api
 */

// Read custom environment variable if provided by bundler, or compute platform default
const DEFAULT_PORT = 5000;

export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}/api`;
  }

  return `http://localhost:${DEFAULT_PORT}/api`;
};

export const API_BASE_URL = getBaseUrl();

export default {
  API_BASE_URL,
  TIMEOUT: 10000
};
