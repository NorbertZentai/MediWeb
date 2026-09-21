import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AccountActionsSection from '../AccountActionsSection';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { exportDataDirect, deleteAccount } from 'features/profile/profile.api';
import { showAlert, showConfirm } from 'utils/dialogs';

jest.mock('expo-file-system', () => ({
    documentDirectory: 'file:///mock/',
    EncodingType: { UTF8: 'utf8' },
    writeAsStringAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn(() => Promise.resolve(false)),
    shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('features/profile/profile.api', () => ({
    deleteAccount: jest.fn(),
    exportDataDirect: jest.fn(),
}));

jest.mock('utils/dialogs', () => ({
    showAlert: jest.fn(),
    showConfirm: jest.fn(),
}));

const logout = jest.fn();

function renderSection() {
    return render(
        <AuthContext.Provider value={{ user: { id: 1 }, logout }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <AccountActionsSection />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

/** Runs the confirm dialog's onConfirm, which opens the password form. */
async function openPasswordForm() {
    await fireEvent.press(screen.getByText('Fiók törlése'));
    const [, , options] = showConfirm.mock.calls[0];
    await options.onConfirm();
}

describe('AccountActionsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('az "Adatok exportálása" gombra kattintva egyszer hívja az export api-t', async () => {
        exportDataDirect.mockResolvedValue({ some: 'data' });

        await renderSection();
        await fireEvent.press(screen.getByText('Adatok exportálása'));

        await waitFor(() => expect(exportDataDirect).toHaveBeenCalledTimes(1));
    });

    it('a törlés a showConfirm onConfirm meghívásáig nem kér jelszót és nem hívja a deleteAccount-ot', async () => {
        await renderSection();
        await fireEvent.press(screen.getByText('Fiók törlése'));

        expect(showConfirm).toHaveBeenCalledTimes(1);
        expect(deleteAccount).not.toHaveBeenCalled();
        expect(screen.queryByTestId('account-deletion-password-input')).toBeNull();

        const [, , options] = showConfirm.mock.calls[0];
        expect(options.confirmText).toBe('Törlés');
        expect(options.destructive).toBe(true);
    });

    it('a megerősítés után jelszót kér, és csak azzal hívja a deleteAccount-ot (issue #84)', async () => {
        deleteAccount.mockResolvedValue({});

        await renderSection();
        await openPasswordForm();

        const passwordInput = await screen.findByTestId('account-deletion-password-input');
        expect(deleteAccount).not.toHaveBeenCalled();

        await fireEvent.changeText(passwordInput, 'correct-horse-battery-staple');
        await fireEvent.press(screen.getByTestId('account-deletion-confirm-button'));

        await waitFor(() =>
            expect(deleteAccount).toHaveBeenCalledWith('correct-horse-battery-staple')
        );
        await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    });

    it('üres jelszóval nem hívja a deleteAccount-ot', async () => {
        await renderSection();
        await openPasswordForm();

        await screen.findByTestId('account-deletion-password-input');
        await fireEvent.press(screen.getByTestId('account-deletion-confirm-button'));

        await waitFor(() => expect(showAlert).toHaveBeenCalled());
        expect(deleteAccount).not.toHaveBeenCalled();
    });

    it('sikertelen törlésnél a backend hibaüzenetét mutatja, nem nyeli el', async () => {
        deleteAccount.mockRejectedValue({
            response: { data: { message: 'Helytelen jelszó.' } },
        });

        await renderSection();
        await openPasswordForm();

        const passwordInput = await screen.findByTestId('account-deletion-password-input');
        await fireEvent.changeText(passwordInput, 'wrong-password');
        await fireEvent.press(screen.getByTestId('account-deletion-confirm-button'));

        await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith('wrong-password'));
        await waitFor(() =>
            expect(showAlert).toHaveBeenCalledWith('Hiba történt', 'Helytelen jelszó.')
        );
        expect(logout).not.toHaveBeenCalled();
    });
});
