import api from "api/config";

export const getReviewsForMedication = async (itemId) => {
  const response = await api.get(`/api/review/${itemId}`);
  return response.data;
};

export const submitReview = async (itemId, review) => {
  const response = await api.post(`/api/review/${itemId}`, review);
  return response.data;
};

export const updateReview = async (itemId, review) => {
  const response = await api.put(`/api/review/${itemId}`, review);
  return response.data;
};