import api from "api/config";

export const getHomeDashboard = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};

export const getPopularMedications = async () => {
  const response = await api.get("/api/dashboard/popular-medications");
  return response.data;
};
