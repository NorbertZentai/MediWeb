import api from "api/config";

// ────────── Dashboard ──────────

export const getAdminDashboard = async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
};

// ────────── User Management ──────────

export const getAdminUsers = async ({ search = '', page = 0, size = 20 } = {}) => {
    const params = { page, size };
    if (search) params.search = search;
    const response = await api.get('/api/admin/users', { params });
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await api.put(`/api/admin/users/${userId}/role?role=${role}`);
    return response.data;
};

export const toggleUserActive = async (userId, active) => {
    const response = await api.put(`/api/admin/users/${userId}/active?active=${active}`);
    return response.data;
};

export const deleteAdminUser = async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
};

// ────────── Review Moderation ──────────

export const getAdminReviews = async ({ checked, page = 0, size = 20 } = {}) => {
    const params = { page, size };
    if (checked !== undefined && checked !== null) params.checked = checked;
    const response = await api.get('/api/admin/reviews', { params });
    return response.data;
};

export const checkReview = async (reviewId) => {
    const response = await api.put(`/api/admin/reviews/${reviewId}/check`);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/api/admin/reviews/${reviewId}`);
    return response.data;
};

export const getReportedReviews = async ({ page = 0, size = 20 } = {}) => {
    const response = await api.get('/api/admin/reviews/reported', { params: { page, size } });
    return response.data;
};

export const dismissReport = async (reportId) => {
    const response = await api.delete(`/api/admin/reviews/reports/${reportId}`);
    return response.data;
};

// ────────── Medication Sync ──────────

export const getSyncConfig = async () => {
    const response = await api.get('/api/admin/sync/config');
    return response.data;
};

export const updateSyncConfig = async (config) => {
    const response = await api.put('/api/admin/sync/config', config);
    return response.data;
};

export const getSyncStatus = async () => {
    const response = await api.get('/api/medication/sync/status');
    return response.data;
};

export const startSync = async ({ force = false, limit } = {}) => {
    const params = { force };
    if (limit) params.limit = limit;
    const response = await api.post('/api/medication/sync/start', null, { params });
    return response.data;
};

export const stopSync = async () => {
    const response = await api.post('/api/medication/sync/stop');
    return response.data;
};

export const startImageSync = async ({ force = false, cleanup = false } = {}) => {
    const params = { force, cleanup };
    const response = await api.post('/api/medication/sync/images', null, { params });
    return response.data;
};
