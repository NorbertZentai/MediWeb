import axios from "axios";
import { Platform } from "react-native";
import storage from "utils/storage";
import { emitLogout } from "utils/authEvents";

// Decide API base URL for web + mobile.
// Prefer EXPO_PUBLIC_API_URL (set in Render for web builds, and in .env for local dev).
const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL; // Expo recommends EXPO_PUBLIC_ vars [web:317]
  if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, ""); // remove trailing slashes
  }

  // Fallbacks if EXPO_PUBLIC_API_URL is missing
  // Android emulator uses 10.0.2.2 to access host machine's localhost
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }

  // iOS simulator and web dev commonly use localhost
  return "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // JWT in Authorization header => no withCredentials needed
});

// Request interceptor for JWT token + dev logging
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("authToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === "development") {
      const url = `${config.baseURL || ""}${config.url || ""}`;
      console.log("[API] Request:", url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Token expired/invalid
      emitLogout();
      return Promise.reject(error);
    }

    // Avoid noisy logs for expected cases
    if (status !== 401 && status !== 403 && status !== 409) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unknown API Error";
      console.error("[API] Error:", errorMsg, status ? `(Status: ${status})` : "");
    }

    return Promise.reject(error);
  }
);

export default api;
