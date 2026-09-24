import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import UsersTab from '../UsersTab';
import { getAdminUsers } from '../../admin.api';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

jest.mock('../../admin.api', () => ({
    getAdminUsers: jest.fn(),
    updateUserRole: jest.fn(),
    toggleUserActive: jest.fn(),
    deleteAdminUser: jest.fn(),
}));

const users = {
    content: [
        { id: 1, name: 'Teszt Elek', email: 'teszt@example.com', role: 'USER', isActive: true, registrationDate: '2024-01-01', lastLogin: '2024-01-02' },
        { id: 2, name: 'Admin Ádám', email: 'adam@example.com', role: 'ADMIN', isActive: false, registrationDate: '2024-01-01', lastLogin: '2024-01-02' },
    ],
    totalPages: 3,
};

async function renderTab() {
    getAdminUsers.mockResolvedValue(users);
    const r = await render(<UsersTab />);
    await waitFor(() => expect(screen.getByText('Teszt Elek')).toBeTruthy());
    return r;
}

describe('UsersTab a11y', () => {
    beforeEach(() => jest.clearAllMocks());

    it('a sor műveletek nevet tartalmazó címkét kapnak', async () => {
        await renderTab();
        expect(screen.getByRole('button', { name: 'Admin jog megadása: Teszt Elek' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Tiltás: Teszt Elek' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Törlés: Teszt Elek' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Admin jog elvétele: Admin Ádám' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Aktiválás: Admin Ádám' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Törlés: Admin Ádám' })).toBeTruthy();
    });

    it('a lapozó az AdminPagination címkéit használja', async () => {
        await renderTab();
        expect(screen.getByRole('button', { name: 'Előző oldal' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Következő oldal' })).toBeTruthy();
    });

    it('minden interaktív elem hozzáférhető', async () => {
        const { toJSON } = await renderTab();
        assertInteractiveNodesAreAccessible(toJSON());
    });

    it('a kereső mező "Felhasználók keresése" címkét kap', async () => {
        await renderTab();
        expect(screen.getByLabelText('Felhasználók keresése')).toBeTruthy();
    });
});
