import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
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

async function renderScreen() {
    await render(
        <AuthContext.Provider value={{ user: { id: 1, is2faEnabled: false }, logout: jest.fn(), setUser: jest.fn() }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
                <SettingsScreen />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
    await waitFor(() => expect(fetchUserPreferences).toHaveBeenCalled());
}

// Issue #91
describe('SettingsScreen accessibility (#91)', () => {
    it('exposes the account rows as buttons and the notification toggles as switches', async () => {
        await renderScreen();
        expect(screen.getByRole('button', { name: 'Profil adatok' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Fiók törlése' })).toBeTruthy();
        const email = screen.getByRole('switch', { name: 'Email értesítések' });
        expect(email.props.accessibilityState).toEqual(expect.objectContaining({ checked: expect.any(Boolean) }));
        expect(screen.getByRole('switch', { name: 'Push értesítések' })).toBeTruthy();
    });

    it('exposes the 2FA action as a button', async () => {
        await renderScreen();
        expect(screen.getAllByRole('button', { name: /2FA/ }).length).toBeGreaterThan(0);
    });

    it('labels the account deletion password input and modal buttons', async () => {
        await renderScreen();
        await fireEvent.press(screen.getByText('Fiók törlése'));
        expect(screen.getByLabelText('Jelenlegi jelszó')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Végleges törlés' })).toBeTruthy();
    });
});
