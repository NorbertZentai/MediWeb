import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsTab from '../SettingsTab';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { fetchUserPreferences, updateUserPreferences } from 'features/profile/profile.api';

jest.mock('react-native-qrcode-svg', () => 'QRCode');
jest.mock('expo-file-system', () => ({
    documentDirectory: 'file:///mock/',
    EncodingType: { UTF8: 'utf8' },
    writeAsStringAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn(() => Promise.resolve(false)),
    shareAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('utils/medicationCache', () => ({
    getCacheInfo: jest.fn(() => Promise.resolve({ count: 0 })),
    clearCache: jest.fn(() => Promise.resolve()),
}));

// requestAccountDeletion is mocked here as jest.fn() only; it is not a real
// export of profile.api.js on origin/ai/demo (pre-existing GDPR defect, see
// AccountActionsSection.test.js for details). Not asserted in this suite.
jest.mock('features/profile/profile.api', () => ({
    fetchUserPreferences: jest.fn(() => Promise.resolve({
        notifications: { medicationReminders: true, summaryEmails: true, refillAlerts: false, pushEnabled: true },
        general: { language: 'hu', theme: 'system', timezone: 'Europe/Budapest', dailyDigestHour: '08:00' },
        data: { anonymizedAnalytics: true },
    })),
    updateUserPreferences: jest.fn((prefs) => Promise.resolve(prefs)),
    exportDataDirect: jest.fn(),
    requestAccountDeletion: jest.fn(),
    generate2FA: jest.fn(),
    enable2FA: jest.fn(),
    disable2FA: jest.fn(),
}));

function renderSettingsTab() {
    return render(
        <AuthContext.Provider value={{ user: { id: 1, is2faEnabled: false }, logout: jest.fn(), setUser: jest.fn() }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <SettingsTab />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

describe('SettingsTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchUserPreferences.mockResolvedValue({
            notifications: { medicationReminders: true, summaryEmails: true, refillAlerts: false, pushEnabled: true },
            general: { language: 'hu', theme: 'system', timezone: 'Europe/Budapest', dailyDigestHour: '08:00' },
            data: { anonymizedAnalytics: true },
        });
        updateUserPreferences.mockImplementation((prefs) => Promise.resolve(prefs));
    });

    it('megjeleníti mind a hét magyar szekciócímet', async () => {
        await renderSettingsTab();

        await waitFor(() => expect(fetchUserPreferences).toHaveBeenCalled());

        expect(screen.getByText('Értesítési beállítások')).toBeTruthy();
        expect(screen.getByText('Általános beállítások')).toBeTruthy();
        expect(screen.getByText('Adatkezelés')).toBeTruthy();
        expect(screen.getByText('Biztonság (2FA)')).toBeTruthy();
        expect(screen.getByText('Fiókműveletek')).toBeTruthy();
        expect(screen.getByText('Offline cache')).toBeTruthy();
        expect(screen.getByText('Fiók')).toBeTruthy();
    });

    it('egy megváltoztatott beállítás mentése után pontosan egyszer hívja az updateUserPreferences-t', async () => {
        const view = await renderSettingsTab();

        await waitFor(() => expect(fetchUserPreferences).toHaveBeenCalled());

        const [medicationRemindersSwitch] = view.getAllByRole('switch');
        await fireEvent(medicationRemindersSwitch, 'valueChange', false);

        await fireEvent.press(screen.getByText('Beállítások mentése'));

        await waitFor(() => expect(updateUserPreferences).toHaveBeenCalledTimes(1));
        expect(updateUserPreferences).toHaveBeenCalledWith(
            expect.objectContaining({
                notifications: expect.objectContaining({ medicationReminders: false }),
            })
        );
    });
});
