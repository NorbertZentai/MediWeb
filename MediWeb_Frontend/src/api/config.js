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

// --- Retry & refresh helpers ---

const MAX_RETRIES = 2;

/** Exponential backoff delay: 1s, 2s */
const getRetryDelay = (retryCount) => retryCount * 1000;

/** Promise-based delay (cross-platform, no web-only APIs) */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Returns true for errors that should be retried (5xx or network failures) */
const isRetryableError = (error) => {
  // Network error / timeout (no response object at all)
  if (!error.response) return true;
  // Server errors (500-599)
  return error.response.status >= 500;
};

// Token-refresh state (module-level so all in-flight requests share it)
let isRefreshing = false;
let failedQueue = [];

/** Resolve or reject every queued request once the refresh finishes */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// --- Axios instance ---

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

// Response interceptor for retry logic, token refresh, and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 1. Retry on 5xx / network errors (up to MAX_RETRIES) ──
    if (isRetryableError(error)) {
      originalRequest.__retryCount = originalRequest.__retryCount || 0;

      if (originalRequest.__retryCount < MAX_RETRIES) {
        originalRequest.__retryCount += 1;
        const waitMs = getRetryDelay(originalRequest.__retryCount);

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[API] Retry ${originalRequest.__retryCount}/${MAX_RETRIES} after ${waitMs}ms`
          );
        }

        await delay(waitMs);
        return api(originalRequest);
      }
    }

    const status = error?.response?.status;

    // ── 2. Token refresh on 401 ──
    if (status === 401 && !originalRequest.__isRetryAfterRefresh) {
      // If another request is already refreshing, queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      originalRequest.__isRetryAfterRefresh = true;

      try {
        const currentToken = await storage.getItem("authToken");

        // Use raw axios (NOT the api instance) to avoid interceptor loops
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { token: currentToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newToken = refreshResponse.data.token;
        await storage.setItem("authToken", newToken);

        // Unblock all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request with the fresh token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — force logout
        emitLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 3. Error logging (avoid noisy logs for expected cases) ──
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
