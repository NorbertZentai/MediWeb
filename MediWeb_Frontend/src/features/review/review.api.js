import api from "api/config";

export const getReviewsForMedication = async (itemId) => {
  const response = await api.get(`/api/reviews/${itemId}`);
  return response.data;
};

export const submitReview = async (itemId, review) => {
  const response = await api.post(`/api/reviews/${itemId}`, review);
  return response.data;
};

export const updateReview = async (itemId, review) => {
  const response = await api.put(`/api/reviews/${itemId}`, review);
  return response.data;
};