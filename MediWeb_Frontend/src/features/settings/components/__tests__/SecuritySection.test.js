import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SecuritySection from '../SecuritySection';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { generate2FA, enable2FA } from 'features/profile/profile.api';
import { showAlert } from 'utils/dialogs';

jest.mock('react-native-qrcode-svg', () => 'QRCode');

jest.mock('features/profile/profile.api', () => ({
    generate2FA: jest.fn(),
    enable2FA: jest.fn(),
    disable2FA: jest.fn(),
}));

jest.mock('utils/dialogs', () => ({
    showAlert: jest.fn(),
    showConfirm: jest.fn(),
}));

async function renderSecuritySection(authValue = {}) {
    return render(
        <AuthContext.Provider value={{ user: { id: 1, is2faEnabled: false }, setUser: jest.fn(), ...authValue }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <SecuritySection />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

describe('SecuritySection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('a kód megadása és beküldése után egyszer hívja az enable2FA-t a titokkal és a kóddal', async () => {
        generate2FA.mockResolvedValue({ uri: 'otpauth://totp/test', secret: 'SECRET123' });
        enable2FA.mockResolvedValue({ message: 'ok' });

        await renderSecuritySection();

        await fireEvent.press(screen.getByText('Bekapcsolás'));
        await waitFor(() => expect(screen.getByPlaceholderText('6 jegyű kód')).toBeTruthy());

        await fireEvent.changeText(screen.getByPlaceholderText('6 jegyű kód'), '123456');
        await fireEvent.press(screen.getByText('Megerősítés'));

        await waitFor(() => expect(enable2FA).toHaveBeenCalledTimes(1));
        expect(enable2FA).toHaveBeenCalledWith('SECRET123', '123456');
    });

    it('hibás kód esetén a "Hibás kód. Próbáld újra." üzenetet jeleníti meg a showAlert-en keresztül', async () => {
        generate2FA.mockResolvedValue({ uri: 'otpauth://totp/test', secret: 'SECRET123' });
        enable2FA.mockRejectedValue(new Error('invalid code'));

        await renderSecuritySection();

        await fireEvent.press(screen.getByText('Bekapcsolás'));
        await waitFor(() => expect(screen.getByPlaceholderText('6 jegyű kód')).toBeTruthy());

        await fireEvent.changeText(screen.getByPlaceholderText('6 jegyű kód'), '654321');
        await fireEvent.press(screen.getByText('Megerősítés'));

        await waitFor(() => expect(showAlert).toHaveBeenCalledWith('Hiba', 'Hibás kód. Próbáld újra.'));
    });
});
