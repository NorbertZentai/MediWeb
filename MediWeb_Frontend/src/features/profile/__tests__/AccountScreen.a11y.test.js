import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AccountScreen from '../AccountScreen';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { fetchCurrentUser } from 'features/profile/profile.api';

jest.mock('features/profile/profile.api', () => ({
    fetchCurrentUser: jest.fn(),
    updateUsername: jest.fn(),
    updateEmail: jest.fn(),
    updatePassword: jest.fn(),
    updatePhoneNumber: jest.fn(),
    updateProfileImage: jest.fn(),
}));

// Issue #91
describe('AccountScreen accessibility (#91)', () => {
    it('exposes the avatar action as a button and labels the edit input', async () => {
        fetchCurrentUser.mockResolvedValue({ name: 'Anna', email: 'a@b.hu', phone_number: '123' });
        await render(
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <AccountScreen />
            </ThemeContext.Provider>
        );
        await waitFor(() => expect(screen.getByText('Kép módosítása')).toBeTruthy());
        expect(screen.getByRole('button', { name: 'Kép módosítása' })).toBeTruthy();

        const edits = screen.getAllByRole('button').filter((b) => b.props.accessibilityLabel);
        expect(edits.length).toBeGreaterThan(1);

        await fireEvent.press(screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]);
        expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
    });
});
