import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import TwoFactorSection from '../TwoFactorSection';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { generate2FA, enable2FA } from 'features/profile/profile.api';

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

function renderSection() {
    return render(
        <AuthContext.Provider value={{ user: { id: 1, is2faEnabled: false }, setUser: jest.fn() }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <TwoFactorSection />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

describe('TwoFactorSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('a kód megadása és beküldése után egyszer hívja az enable2FA-t a titokkal és a kóddal', async () => {
        generate2FA.mockResolvedValue({ uri: 'otpauth://totp/test', secret: 'SECRET456' });
        enable2FA.mockResolvedValue({ message: 'ok' });

        await renderSection();

        await fireEvent.press(screen.getByText('2FA bekapcsolása'));
        await waitFor(() => expect(screen.getByPlaceholderText('6 számjegyű kód')).toBeTruthy());

        await fireEvent.changeText(screen.getByPlaceholderText('6 számjegyű kód'), '111222');
        await fireEvent.press(screen.getByText('Megerősítés és bekapcsolás'));

        await waitFor(() => expect(enable2FA).toHaveBeenCalledTimes(1));
        expect(enable2FA).toHaveBeenCalledWith('SECRET456', '111222');
    });
});
