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
        const loginResponse = await apiLogin(credentials);
        
        // Save JWT token from login response
        if (loginResponse.token) {
            localStorage.setItem('authToken', loginResponse.token);
            localStorage.setItem('isLoggedIn', 'true');
        }
        
        // Fetch current user data using the new token
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
            // Remove both JWT token and login state from localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('isLoggedIn');
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            // Check if JWT token exists in localStorage
            const token = localStorage.getItem('authToken');
            const wasLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (!token || !wasLoggedIn) {
                // No token or user was never logged in, skip API call
                setUser(null);
                setLoading(false);
                return;
            }

            // Token exists, try to fetch current user
            try {
                const currentUser = await fetchCurrentUser(true); // Silent mode
                setUser(currentUser);
                if (!currentUser) {
                    // API returned null, clear localStorage
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('isLoggedIn');
                }
            } catch (error) {
                // If fetchCurrentUser fails, user is not logged in
                localStorage.removeItem('authToken');
                localStorage.removeItem('isLoggedIn');
                setUser(null);
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