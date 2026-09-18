import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AccountSection from '../AccountSection';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { deleteAccount } from 'features/profile/profile.api';
import { showAlert } from 'utils/dialogs';

jest.mock('features/profile/profile.api', () => ({
    deleteAccount: jest.fn(),
}));

jest.mock('utils/dialogs', () => ({
    showAlert: jest.fn(),
    showConfirm: jest.fn(),
}));

async function renderAccountSection(authValue = {}) {
    return render(
        <AuthContext.Provider value={{ logout: jest.fn(), ...authValue }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <AccountSection
                    emailEnabled
                    pushEnabled
                    onEmailToggle={jest.fn()}
                    onPushToggle={jest.fn()}
                />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

describe('AccountSection — fiók törlése', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('üres jelszóval a showAlert-et hívja és nem hívja meg a deleteAccount-ot', async () => {
        await renderAccountSection();

        await fireEvent.press(screen.getByText('Fiók törlése'));
        await waitFor(() => expect(screen.getByText('Végleges törlés')).toBeTruthy());

        await fireEvent.press(screen.getByText('Végleges törlés'));

        await waitFor(() => expect(showAlert).toHaveBeenCalledWith('Hiba', 'Kérjük, add meg a jelszavad a törléshez!'));
        expect(deleteAccount).not.toHaveBeenCalled();
    });

    it('jelszó megadása és a modal megerősítő gombjának megnyomása után pontosan egyszer hívja a deleteAccount-ot azzal a jelszóval', async () => {
        deleteAccount.mockResolvedValue({});
        const logout = jest.fn();

        await renderAccountSection({ logout });

        await fireEvent.press(screen.getByText('Fiók törlése'));
        await waitFor(() => expect(screen.getByPlaceholderText('Jelenlegi jelszó')).toBeTruthy());

        await fireEvent.changeText(screen.getByPlaceholderText('Jelenlegi jelszó'), 'titkosJelszo1');
        expect(deleteAccount).not.toHaveBeenCalled();

        await fireEvent.press(screen.getByText('Végleges törlés'));

        await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
        expect(deleteAccount).toHaveBeenCalledWith('titkosJelszo1');
        expect(logout).toHaveBeenCalledTimes(1);
    });
});
