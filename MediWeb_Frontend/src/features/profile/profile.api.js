import api from "api/config";

// AUTHENTICATION

export const fetchCurrentUser = async (silent = false) => {
  try {
    const response = await api.get("/auth/me", {
      // Add silent flag to suppress network errors in browser dev tools
      metadata: { silent }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    // Only throw error if not in silent mode
    if (!silent) {
      throw error;
    }
    return null;
  }
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

export const addToFavorites = async (medicationId) => {
  const response = await api.post(`/api/favorites/${medicationId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get(`/api/favorites`);
  return response.data;
};

export const removeFromFavorites = async (favoriteId) => {
  console.log("favoriteId: ", favoriteId);
  const response = await api.delete(`/api/favorites/${favoriteId}`);
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

// INTAKE for Profile

export const getTodaysMedications = async (profileId) => {
  const res = await api.get(`/api/intake/today/${profileId}`);
  return res.data;
};

export const submitIntake = async ({ profileMedicationId, time, taken }) => {
  return api.post("/api/intake", { profileMedicationId, time, taken });
};

// SETTINGS

export const fetchUserPreferences = async () => {
  const response = await api.get(`/api/users/preferences`);
  return response.data;
};

export const updateUserPreferences = async (preferences) => {
  const response = await api.put(`/api/users/preferences`, preferences);
  return response.data;
};

export const requestDataExport = async () => {
  const response = await api.post(`/api/users/data-export`);
  return response.data;
};

export const requestAccountDeletion = async () => {
  const response = await api.post(`/api/users/account-deletion`);
  return response.data;
};