import api from "api/config";

// AUTHENTICATION

export const fetchCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// USER PROFILE

export const updateUsername = async (username) => {
  const response = await api.put(`/api/users/username`, username, {
    headers: { "Content-Type": "text/plain" },
  });
  return response.data;
};

export const updateEmail = async (email) => {
  const response = await api.put(`/api/users/email`, email, {
    headers: { "Content-Type": "text/plain" },
  });
  return response.data;
};

export const updatePassword = async (currentPassword, newPassword, reNewPassword) => {
  const response = await api.put(`/api/users/password`, {
    currentPassword,
    newPassword,
    reNewPassword,
  });
  return response.data;
};

export const updatePhoneNumber = async (phoneNumber) => {
  const response = await api.put(`/api/users/phone`, phoneNumber, {
    headers: { "Content-Type": "text/plain" },
  });
  return response.data;
};

export const updateProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await api.put(`/api/users/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteProfile = async (profileId) => {
  const response = await api.delete(`/api/profiles/${profileId}`);
  return response.data;
}

// FAVORITES

export const addToFavorites = async (itemId) => {
  const response = await api.post(`/api/favorites`, itemId);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get(`/api/favorites`);
  return response.data;
};

// PROFILE ENTITIES

export const getProfilesForUser = async () => {
  const response = await api.get("/api/profiles");
  return response.data;
};

export const createProfile = async (name, notes) => {
  const response = await api.post(`/api/profiles`, { name, notes });
  return response.data;
};

export const updateProfile = async (profileId, name, notes) => {
  const response = await api.put(`/api/profiles/${profileId}`, { name, notes });
  return response.data;
};

// MEDICATIONS for Profile

export const getMedicationsForProfile = async (profileId) => {
  const response = await api.get(`/api/profiles/${profileId}/medications`);
  return response.data;
};

export const addMedicationToProfile = async (profileId, itemId) => {
  const response = await api.post(`/api/profiles/addMedication/${profileId}`, { itemId: parseInt(itemId) } );
  return response.data;
};

export const removeMedicationFromProfile = async (profileId, itemId) => {
  const response = await api.delete(`/api/profiles/${profileId}/medications/${itemId}`);
  return response.data;
};

export const updateMedicationForProfile = async (profileId, medicationId, data) => {
  const response = await api.put(`/api/profiles/${profileId}/medications/${medicationId}`, data);
  return response.data;
};