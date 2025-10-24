import api from "api/config";

export const searchMedications = async (params) => {
  const response = await api.get("/api/medication/search", { params });
  return response.data;
};