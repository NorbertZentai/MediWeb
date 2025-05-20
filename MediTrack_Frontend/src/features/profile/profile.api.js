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

export const updateUsername = async (userId, username) => {
  const response = await api.put(`/api/profile/${userId}`, username);
  return response.data;
}

export const updateEmail = async (userId, email) => {
  const response = await api.put(`/api/profile/${userId}`, email);
  return response.data;
}

export const updatePassword = async (userId, currentPassword, newPassword, reNewPassword) => {
  const response = await api.put(`/api/profile/${userId}`, 
    {
    currentPassword,
    newPassword,
    reNewPassword
    }
  );
  return response.data;
}

export const updatePhoneNumber = async (userId, phoneNumber) => {
  const response = await api.put(`/api/profile/${userId}/phone`, phoneNumber);
  return response.data;
};

export const updateProfileImage = async (userId, imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await api.put(`/api/profile/${userId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
};