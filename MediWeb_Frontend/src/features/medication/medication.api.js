import api from "api/config";

export const getMedicationDetails = async (itemId) => {
  const response = await api.get(`/api/medication/${itemId}`);
  return response.data;
};

export const getMedicationSyncStatus = async () => {
  const response = await api.get('/api/medication/sync/status');
  return response.data;
};

export const startMedicationSync = async (force = false, extraParams = {}) => {
  const params = {
    force,
    ...(extraParams || {}),
  };
  const response = await api.post('/api/medication/sync/start', null, {
    params,
  });
  return response.data;
};

export const startImageSync = async (force = false, cleanup = false) => {
  const response = await api.post('/api/medication/sync/images', null, {
    params: { force, cleanup },
  });
  return response.data;
};

export const stopMedicationSync = async () => {
  const response = await api.post('/api/medication/sync/stop');
  return response.data;
};