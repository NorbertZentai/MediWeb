import api from "api/config";

export const searchMedications = async (query) => {
  const response = await api.get("/api/search", { params: query });
  return response.data;
};

export const getFilterOptions = async (name) => {
  const response = await api.get(`/api/filters/${name}`);
  return response.data;
};