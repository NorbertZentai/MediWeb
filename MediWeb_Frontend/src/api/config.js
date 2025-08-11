import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     process.env.EXPO_PUBLIC_API_URL || 
                     "https://mediweb-backend.onrender.com";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable credentials for session-based authentication
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.baseURL + config.url);
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