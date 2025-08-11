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
        // Store login state in localStorage
        if (currentUser) {
            localStorage.setItem('isLoggedIn', 'true');
        }
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
            // Remove login state from localStorage
            localStorage.removeItem('isLoggedIn');
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            // Check localStorage first to avoid unnecessary API calls
            const wasLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (!wasLoggedIn) {
                // User was never logged in, skip API call
                setUser(null);
                setLoading(false);
                return;
            }

            // Check if there's a session cookie before making API call
            const hasSessionCookie = document.cookie.includes('Session=') || 
                                    document.cookie.includes('JSESSIONID=');
            
            if (!hasSessionCookie) {
                // No session cookie but localStorage says logged in - session expired
                localStorage.removeItem('isLoggedIn');
                setUser(null);
                setLoading(false);
                return;
            }

            // Only make API call if localStorage and cookies suggest user might be logged in
            try {
                const currentUser = await fetchCurrentUser(true); // Silent mode
                setUser(currentUser);
                if (!currentUser) {
                    // API returned null, clear localStorage
                    localStorage.removeItem('isLoggedIn');
                }
            } catch (error) {
                // If fetchCurrentUser fails, user is not logged in
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