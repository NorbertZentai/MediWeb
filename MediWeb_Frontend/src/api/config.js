import axios from "axios";
import { Platform } from "react-native";

// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost directly
// Physical devices need the actual LAN IP
const getApiBaseUrl = () => {
  // If env var is set and not localhost, use it (e.g., production URL)
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes("localhost")) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // For development: use platform-specific localhost access
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080"; // Android emulator -> host localhost
  }
  return "http://localhost:8080"; // iOS simulator / Web
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't log 401 errors as they are expected when not logged in
    if (error.response?.status !== 401) {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;