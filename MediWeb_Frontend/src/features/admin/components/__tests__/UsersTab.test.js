import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import UsersTab from '../UsersTab';
import { getAdminUsers } from '../../admin.api';

jest.mock('../../admin.api', () => ({
    getAdminUsers: jest.fn(),
    updateUserRole: jest.fn(),
    toggleUserActive: jest.fn(),
    deleteAdminUser: jest.fn(),
}));

describe('UsersTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('betöltés közben a töltő állapotot jeleníti meg', async () => {
        getAdminUsers.mockReturnValue(new Promise(() => {}));

        await render(<UsersTab />);

        expect(screen.getByTestId('admin-loading')).toBeTruthy();
    });

    it('betöltés után megjeleníti a felhasználók listáját és meghívja az api-t', async () => {
        getAdminUsers.mockResolvedValue({
            content: [
                { id: 1, name: 'Teszt Elek', email: 'teszt@example.com', role: 'USER', isActive: true, registrationDate: '2024-01-01', lastLogin: '2024-01-02' },
            ],
            totalPages: 1,
        });

        await render(<UsersTab />);

        await waitFor(() => expect(screen.getByText('Teszt Elek')).toBeTruthy());
        expect(screen.getByText('teszt@example.com')).toBeTruthy();
        expect(screen.getByText('Felhasználókezelés')).toBeTruthy();
        expect(getAdminUsers).toHaveBeenCalledTimes(1);
        expect(getAdminUsers).toHaveBeenCalledWith({ search: '', page: 0, size: 15 });
    });
});
