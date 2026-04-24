import api from "api/config";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        // Extract the error message from the response
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.status === 400) {
            throw new Error('Az email cím már használatban van, vagy hibás adatok!');
        } else {
            throw new Error('Regisztrációs hiba történt. Próbáld újra!');
        }
    }
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const verifyEmail = async (email, code) => {
    try {
        const response = await api.post('/auth/verify-email', { email, code });
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw new Error(typeof error.response.data === 'string' ? error.response.data : error.response.data.message);
        }
        throw new Error('Hiba történt az email megerősítése során.');
    }
};