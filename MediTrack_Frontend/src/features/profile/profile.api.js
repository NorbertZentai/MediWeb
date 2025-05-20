import api from "api/config";

export const fetchCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const getProfilesForUser = async () => {
  const response = await api.get("/api/profiles");
  return response.data;
};

export const addMedicationToProfile = async (profileId, itemId) => {
  const response = await api.post(`/api/profiles/addMedication/${profileId}`, itemId);
  return response.data;
};

export const getMedicationsForProfile = async (profileId, itemId) => {
  const response = await api.get(`/api/profiles/${profileId}`, itemId);
  return response.data;
};

export const addToFavorites = async (itemId, userId) => {
  const response = await api.post(`/api/favorites/${userId}`, itemId);
  return response.data;
};

export const getFavorites = async (userId, itemId) => {
  const response = await api.get(`/api/favorites/${userId}`, itemId);
  return response.data;
};