import axios from "axios";
import { Platform } from "react-native";

// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost directly
// Physical devices need the actual LAN IP
const getApiBaseUrl = () => {
  // Use environment variable if defined (configured in .env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback defaults if .env is missing
  if (Platform.OS === "android") {
    // 10.0.2.2 is for Android Emulator. For physical device, configure .env!
    return "http://10.0.2.2:8080";
  }
  return "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

// Only log API Base URL in development mode
if (process.env.NODE_ENV === 'development') {
  console.log("API Base URL:", API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Remove withCredentials for JWT authentication
});

import storage from "utils/storage";

// Request interceptor for JWT token and debugging
api.interceptors.request.use(
  async (config) => {
    // Add JWT token to Authorization header if available
    const token = await storage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only log API requests in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log("API Request:", config.baseURL + config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { emitLogout } from "utils/authEvents";

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't log expected errors (auth, access denied, duplicate/conflict)
    const status = error.response?.status;

    if (status === 401) {
      console.log("🔒 [API] 401 Unauthorized - Triggering logout...");
      emitLogout();
    }

    if (status !== 401 && status !== 403 && status !== 409) {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;