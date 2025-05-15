import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister,logout as apiLogout, fetchCurrentUser } from '../api/auth';

export const AuthContext = createContext();

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
            try {
                const currentUser = await fetchCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.log('No user logged in.');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
