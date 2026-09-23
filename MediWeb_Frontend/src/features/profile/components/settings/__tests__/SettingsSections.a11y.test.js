import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import TwoFactorSection from '../TwoFactorSection';
import AccountActionsSection from '../AccountActionsSection';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme, MIN_TOUCH_TARGET } from 'styles/theme';
import { generate2FA } from 'features/profile/profile.api';

jest.mock('react-native-qrcode-svg', () => 'QRCode');
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn(), push: jest.fn() }) }));
jest.mock('features/profile/profile.api', () => ({
    generate2FA: jest.fn(),
    enable2FA: jest.fn(),
    disable2FA: jest.fn(),
    deleteAccount: jest.fn(),
    exportDataDirect: jest.fn(),
}));
jest.mock('utils/dialogs', () => ({ showAlert: jest.fn(), showConfirm: jest.fn() }));

function size(el) {
    const s = StyleSheet.flatten(el.props.style) || {};
    const h = el.props.hitSlop || {};
    return {
        w: Math.max(s.minWidth || 0, s.width || 0) + (h.left || 0) + (h.right || 0),
        h: Math.max(s.minHeight || 0, s.height || 0) + (h.top || 0) + (h.bottom || 0),
    };
}

function wrap(ui, user = { id: 1, is2faEnabled: false }) {
    return render(
        <AuthContext.Provider value={{ user, setUser: jest.fn(), logout: jest.fn() }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>{ui}</ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

// Issue #91
describe('Profile settings sections accessibility (#91)', () => {
    beforeEach(() => jest.clearAllMocks());

    it('TwoFactorSection: enable button and code input are labelled', async () => {
        generate2FA.mockResolvedValue({ uri: 'otpauth://totp/x', secret: 'S' });
        await wrap(<TwoFactorSection />);
        const enable = screen.getByRole('button', { name: '2FA bekapcsolása' });
        const { h } = size(enable);
        expect(h).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        await fireEvent.press(enable);
        await waitFor(() => expect(screen.getByLabelText('6 számjegyű kód')).toBeTruthy());
        expect(screen.getByRole('button', { name: 'Megerősítés és bekapcsolás' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
    });

    it('TwoFactorSection: disable input is labelled when 2FA is on', async () => {
        await wrap(<TwoFactorSection />, { id: 1, is2faEnabled: true });
        expect(screen.getByLabelText('Jelenlegi 6 számjegyű kód')).toBeTruthy();
        expect(screen.getByRole('button', { name: '2FA kikapcsolása' })).toBeTruthy();
    });

    it('AccountActionsSection: export and delete are buttons with their visible text', async () => {
        await wrap(<AccountActionsSection />);
        expect(screen.getByRole('button', { name: 'Adatok exportálása' })).toBeTruthy();
        const del = screen.getByRole('button', { name: 'Fiók törlése' });
        expect(del.props.accessibilityLabel).toBe('Fiók törlése');
        expect(size(del).h).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    });
});
