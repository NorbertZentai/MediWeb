import React, { createContext, useState, useEffect } from 'react';
import storage from "utils/storage";
import { fetchCurrentUser } from 'features/profile/profile.api';
import { login as apiLogin, register as apiRegister, logout as apiLogout, } from 'features/auth/auth.api';
import { DeviceEventEmitter } from 'react-native';
import { AUTH_EVENTS } from 'utils/authEvents';

export const AuthContext = createContext({
    user: null,
    loading: true,
    login: () => { },
    register: () => { },
    logout: () => { }
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (credentials) => {
        const loginResponse = await apiLogin(credentials);

        // Save JWT token from login response
        if (loginResponse.token) {
            await storage.setItem('authToken', loginResponse.token);
            await storage.setItem('isLoggedIn', 'true');
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
            // Remove both JWT token and login state from storage
            await storage.removeItem('authToken');
            await storage.removeItem('isLoggedIn');
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            // Check if JWT token exists in storage
            const token = await storage.getItem('authToken');
            const isLoggedIn = await storage.getItem('isLoggedIn');
            const wasLoggedIn = isLoggedIn === 'true';

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
                    // API returned null, clear storage
                    await storage.removeItem('authToken');
                    await storage.removeItem('isLoggedIn');
                }
            } catch (error) {
                // If fetchCurrentUser fails, user is not logged in
                await storage.removeItem('authToken');
                await storage.removeItem('isLoggedIn');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // Listen to global logout events (e.g. 401 Unauthorized)
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(AUTH_EVENTS.LOGOUT, () => {
            console.log("🔒 [Auth] Logout event received - Clearing session...");
            // Manually clearing state/storage without calling apiLogout to avoid loop if apiLogout fails with 401
            setUser(null);
            storage.removeItem('authToken');
            storage.removeItem('isLoggedIn');
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};