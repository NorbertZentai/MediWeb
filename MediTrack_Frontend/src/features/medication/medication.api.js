import api from "api/config";

export const getMedicationDetails = async (Id) => {
  const response = await api.get(`/api/medication/${Id}`);
  return response.data;
};