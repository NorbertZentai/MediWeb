import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsTab from '../SettingsTab';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { fetchUserPreferences, updateUserPreferences, deleteAccount } from 'features/profile/profile.api';

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

jest.mock('features/profile/profile.api', () => ({
    fetchUserPreferences: jest.fn(() => Promise.resolve({
        notifications: { medicationReminders: true, summaryEmails: true, refillAlerts: false, pushEnabled: true },
        general: { language: 'hu', theme: 'system', timezone: 'Europe/Budapest', dailyDigestHour: '08:00' },
        data: { anonymizedAnalytics: true },
    })),
    updateUserPreferences: jest.fn((prefs) => Promise.resolve(prefs)),
    exportDataDirect: jest.fn(),
    deleteAccount: jest.fn(),
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

/** Finds the confirm/destructive button passed to the most recent Alert.alert call. */
function pressLatestAlertButton(matchText) {
    const lastCall = Alert.alert.mock.calls[Alert.alert.mock.calls.length - 1];
    const buttons = lastCall[2] || [];
    const button = buttons.find((b) => b.text === matchText) || buttons[buttons.length - 1];
    button.onPress && button.onPress();
}

// Issue #84: the profile tab's "Fiókműveletek → Fiók törlése" control used to call
// requestAccountDeletion(), a function that was removed from profile.api.js. That made
// every deletion attempt throw and get swallowed into a generic error message.
// These tests pin the required fix: the flow must require password re-entry and call
// the real, already-wired deleteAccount(password) endpoint (mirroring AccountSection.js /
// SettingsScreen.js), and any failure must surface a specific message instead of being
// silently swallowed. After issue #77 the control itself lives in
// settings/AccountActionsSection.js; these stay here to pin the flow end-to-end
// through the tab that renders it.
describe('SettingsTab – Fiókműveletek → Fiók törlése (issue #84)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchUserPreferences.mockResolvedValue({});
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    it('jelszó megadását kéri, mielőtt a valós deleteAccount végpontot meghívná', async () => {
        await renderSettingsTab();
        await waitFor(() => screen.getByText('Fiók törlése'));

        await fireEvent.press(screen.getByText('Fiók törlése'));
        expect(Alert.alert).toHaveBeenCalled();
        pressLatestAlertButton('Törlés');

        await waitFor(() =>
            expect(screen.getByTestId('account-deletion-password-input')).toBeTruthy()
        );

        expect(deleteAccount).not.toHaveBeenCalled();
    });

    it('helyes jelszóval a valós deleteAccount(password) végpontot hívja meg', async () => {
        deleteAccount.mockResolvedValue({});
        await renderSettingsTab();
        await waitFor(() => screen.getByText('Fiók törlése'));

        await fireEvent.press(screen.getByText('Fiók törlése'));
        pressLatestAlertButton('Törlés');

        const passwordInput = await screen.findByTestId('account-deletion-password-input');
        await fireEvent.changeText(passwordInput, 'correct-horse-battery-staple');
        await fireEvent.press(await screen.findByTestId('account-deletion-confirm-button'));

        await waitFor(() =>
            expect(deleteAccount).toHaveBeenCalledWith('correct-horse-battery-staple')
        );
    });

    it('sikertelen törlési kérés esetén konkrét hibaüzenetet jelenít meg, nem nyeli el a hibát', async () => {
        deleteAccount.mockRejectedValue({
            response: { data: { message: 'Helytelen jelszó.' } },
        });
        await renderSettingsTab();
        await waitFor(() => screen.getByText('Fiók törlése'));

        await fireEvent.press(screen.getByText('Fiók törlése'));
        pressLatestAlertButton('Törlés');

        const passwordInput = await screen.findByTestId('account-deletion-password-input');
        await fireEvent.changeText(passwordInput, 'wrong-password');
        await fireEvent.press(await screen.findByTestId('account-deletion-confirm-button'));

        await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith('wrong-password'));

        // The surfaced message must be the specific backend error, not the old generic
        // "Nem sikerült rögzíteni a törlési kérelmet." that swallowed every failure.
        await waitFor(() => {
            const alertMessages = Alert.alert.mock.calls.map((call) => call[1]);
            expect(alertMessages).toContain('Helytelen jelszó.');
            expect(alertMessages).not.toContain(
                'Nem sikerült rögzíteni a törlési kérelmet. Próbáld újra később.'
            );
        });
    });
});
