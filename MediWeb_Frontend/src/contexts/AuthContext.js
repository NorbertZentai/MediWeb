import React, { createContext, useState, useEffect } from 'react';
import { fetchCurrentUser } from 'features/profile/profile.api';
import { login as apiLogin, register as apiRegister,logout as apiLogout,  } from 'features/auth/auth.api';

export const AuthContext = createContext({
    user: null,
    loading: true,
    login: () => {},
    register: () => {},
    logout: () => {}
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (credentials) => {
        await apiLogin(credentials);
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
    };

    const register = async (userData) => {
        await apiRegister(userData);
    };
    
    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
        } finally {
            setUser(null);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            const currentUser = await fetchCurrentUser();
            setUser(currentUser);
            setLoading(false);
        };
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};