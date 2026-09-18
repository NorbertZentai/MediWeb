import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../SettingsScreen';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { fetchUserPreferences } from 'features/profile/profile.api';

jest.mock('features/profile/profile.api', () => ({
    fetchUserPreferences: jest.fn(() => Promise.resolve({
        notifications: { medicationReminders: true, pushEnabled: true },
    })),
    updateUserPreferences: jest.fn(() => Promise.resolve({})),
    deleteAccount: jest.fn(),
    generate2FA: jest.fn(),
    enable2FA: jest.fn(),
    disable2FA: jest.fn(),
}));

jest.mock('react-native-qrcode-svg', () => 'QRCode');

function renderSettingsScreen() {
    return render(
        <AuthContext.Provider value={{ user: { id: 1, is2faEnabled: false }, logout: jest.fn(), setUser: jest.fn() }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
                <SettingsScreen />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

describe('SettingsScreen', () => {
    it('megjeleníti mind a négy szekció fejlécét', async () => {
        renderSettingsScreen();

        await waitFor(() => expect(fetchUserPreferences).toHaveBeenCalled());

        expect(screen.getByText('FIÓK')).toBeTruthy();
        expect(screen.getByText('BIZTONSÁG')).toBeTruthy();
        expect(screen.getByText('ALKALMAZÁS')).toBeTruthy();
        expect(screen.getByText('NÉVJEGY')).toBeTruthy();
    });
});
