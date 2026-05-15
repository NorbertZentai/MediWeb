import React, { createContext, useState, useEffect, useContext } from 'react';
import storage from 'utils/storage';
import { lightTheme, darkTheme } from 'styles/theme';
import { useColorScheme, Platform } from 'react-native';

export const ThemeContext = createContext({
    theme: lightTheme,
    isDark: false,
    themeMode: 'system',
    toggleTheme: () => { },
    setThemeMode: (mode) => { }, // 'light', 'dark', 'system'
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState('system'); // 'light', 'dark', 'system'

    // Initialize based on current state (defaults to system if not loaded yet)
    // We'll update this once storage loads
    const isSystemDark = systemScheme === 'dark';
    const resolvedIsDark = themeMode === 'system' ? isSystemDark : themeMode === 'dark';

    useEffect(() => {
        loadThemeParams();
    }, []);

    useEffect(() => {
        if (Platform.OS === 'web') {
            document.body.classList.toggle('dark-theme', resolvedIsDark);
            
            // Inject scrollbar styles once
            if (!document.getElementById('custom-scrollbar-style')) {
                const style = document.createElement('style');
                style.id = 'custom-scrollbar-style';
                style.innerHTML = `
                    ::-webkit-scrollbar { width: 8px; height: 8px; }
                    ::-webkit-scrollbar-track { background: #E5E7EB; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb { background: #9CA3AF; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #2E7D32; }
                    body.dark-theme ::-webkit-scrollbar-track { background: #374151; }
                    body.dark-theme ::-webkit-scrollbar-thumb { background: #6B7280; }
                    body.dark-theme ::-webkit-scrollbar-thumb:hover { background: #4CAF50; }
                `;
                document.head.appendChild(style);
            }
        }
    }, [resolvedIsDark]);

    const loadThemeParams = async () => {
        try {
            const storedTheme = await storage.getItem('themeMode');
            if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
                setThemeModeState(storedTheme);
            }
        } catch (e) {
            console.log('Failed to load theme preference', e);
        }
    };

    const setThemeMode = async (mode) => {
        setThemeModeState(mode);
        try {
            await storage.setItem('themeMode', mode);
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    const toggleTheme = () => {
        // If currently system (and system is dark), we want to go to light.
        // If currently system (and system is light), we want to go to dark.
        // Basically invert the current resolved state.
        const newMode = resolvedIsDark ? 'light' : 'dark';
        setThemeMode(newMode);
    };

    const theme = resolvedIsDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark: resolvedIsDark, themeMode, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
