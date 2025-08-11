import api from "api/config";

export const getMedicationDetails = async (itemId) => {
  const response = await api.get(`/api/medication/${itemId}`);
  return response.data;
};