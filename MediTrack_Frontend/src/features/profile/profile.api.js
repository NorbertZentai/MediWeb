import api from "api/config";

// AUTHENTICATION

export const fetchCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// USER PROFILE

export const updateUsername = async (username) => {
  const response = await api.put(`/api/users/${userId}`, username);
  return response.data;
};
k
export const updateEmail = async (email) => {
  const response = await api.put(`/api/users/${userId}`, email);
  return response.data;
};

export const updatePassword = async (currentPassword, newPassword, reNewPassword) => {
  const response = await api.put(`/api/users/${userId}`, {
    currentPassword,
    newPassword,
    reNewPassword,
  });
  return response.data;
};

export const updatePhoneNumber = async (phoneNumber) => {
  const response = await api.put(`/api/users/${userId}/phone`, phoneNumber);
  return response.data;
};

export const updateProfileImage = async ( imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await api.put(`/api/users/${userId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// FAVORITES

export const addToFavorites = async (itemId, userId) => {
  const response = await api.post(`/api/favorites/${userId}`, itemId);
  return response.data;
};

export const getFavorites = async (userId, itemId) => {
  const response = await api.get(`/api/favorites/${userId}`, itemId);
  return response.data;
};

// PROFILE ENTITIES

export const getProfilesForUser = async () => {
  const response = await api.get("/api/profiles");
  return response.data;
};

export const createProfile = async (name, description) => {
  const response = await api.post(`/api/profile/profiles`, { name, description });
  return response.data;
};

export const updateProfile = async (profileId, name, description) => {
  const response = await api.put(`/api/profiles/${profileId}`, { name, description });
  return response.data;
};

// MEDICATIONS for Profile

export const getMedicationsForProfile = async (profileId) => {
  const response = await api.get(`/api/profiles/${profileId}/medications`);
  return response.data;
};

export const addMedicationToProfile = async (profileId, itemId) => {
  const response = await api.post(`/api/profiles/addMedication/${profileId}`, itemId);
  return response.data;
};

export const removeMedicationFromProfile = async (profileId, itemId) => {
  const response = await api.delete(`/api/profiles/${profileId}/medications/${itemId}`);
  return response.data;
};

export const updateMedicationForProfile = async (profileId, itemId, data) => {
  const response = await api.put(`/api/profiles/${profileId}/medications/${itemId}`, data);
  return response.data;
};

// SEARCH

export const searchMedicationsByName = async (query) => {
  const response = await api.get(
    `/api/medications/search?query=${encodeURIComponent(query)}`
  );
  return response.data;
};