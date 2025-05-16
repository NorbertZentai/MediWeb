import api from "./config";

export const login = async (credentials) => {
  try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
  } catch (error) {
      throw error;
  }
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const fetchCurrentUser = async () => {
  try {
      const response = await api.get("/auth/me");
      return response.data;
  } catch (error) {
      throw error;
  }
};

export const searchMedications = async (query) => {
  const response = await api.get("/api/search", { params: query });
  return response.data;
};

export const getMedicationDetails = async (Id) => {
  const response = await api.get(`/api/medication/${Id}`);
  return response.data;
};

export const getFilterOptions = async (name) => {
  const response = await api.get(`/api/filters/${name}`);
  return response.data;
};

export async function getReviewsForMedication(itemId) {
  const response = await api.get(`/api/review/${itemId}`);
  return response.data;
}

export async function submitReview(itemId, review) {
  const response = await api.post(`/api/review/${itemId}`, review);
  return response.data;
}