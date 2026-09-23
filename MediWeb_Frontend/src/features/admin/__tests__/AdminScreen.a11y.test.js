import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AdminScreen from '../AdminScreen';
import { ThemeContext } from 'contexts/ThemeContext';
import { AuthContext } from 'contexts/AuthContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

jest.mock('../admin.api', () => ({
    getAdminDashboard: jest.fn(() => Promise.resolve({
        totalUsers: 10, activeUsers: 8, totalMedications: 5, totalReviews: 3, uncheckedReviews: 1, reportedReviews: 0,
    })),
    getAdminUsers: jest.fn(() => Promise.resolve({ content: [], totalPages: 0 })),
    updateUserRole: jest.fn(), toggleUserActive: jest.fn(), deleteAdminUser: jest.fn(),
    getAdminReviews: jest.fn(() => Promise.resolve({ content: [], totalPages: 0 })),
    checkReview: jest.fn(), deleteReview: jest.fn(),
    getReportedReviews: jest.fn(() => Promise.resolve({ content: [], totalPages: 0 })),
    dismissReport: jest.fn(),
    getSyncConfig: jest.fn(() => Promise.resolve({})),
    updateSyncConfig: jest.fn(),
    getSyncStatus: jest.fn(() => Promise.resolve({ running: false, phase: 'IDLE' })),
    startSync: jest.fn(), stopSync: jest.fn(), startImageSync: jest.fn(),
}));

async function renderAdmin() {
    return render(
        <AuthContext.Provider value={{ user: { id: 1, name: 'Admin', role: 'ADMIN' }, loading: false }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <AdminScreen />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

describe('AdminScreen a11y', () => {
    it('a tabsor tablist, a 4 fül tab szerepkörrel és kiválasztott állapottal', async () => {
        await renderAdmin();
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(4);
        expect(screen.getByRole('tablist')).toBeTruthy();
        const selected = tabs.filter((t) => t.props.accessibilityState?.selected === true);
        expect(selected).toHaveLength(1);
        expect(screen.getByRole('tab', { name: 'Dashboard' }).props.accessibilityState.selected).toBe(true);
        for (const name of ['Felhasználók', 'Értékelések', 'Szinkron']) {
            expect(screen.getByRole('tab', { name })).toBeTruthy();
        }
    });

    it('a fül megnyomása átvált és kiválasztottá teszi', async () => {
        await renderAdmin();
        await fireEvent.press(screen.getByRole('tab', { name: 'Felhasználók' }));
        expect(screen.getByRole('tab', { name: 'Felhasználók' }).props.accessibilityState.selected).toBe(true);
        expect(screen.getByRole('tab', { name: 'Dashboard' }).props.accessibilityState.selected).toBe(false);
    });

    it('minden interaktív elem hozzáférhető a dashboard fülön', async () => {
        const { toJSON } = await renderAdmin();
        await waitFor(() => expect(screen.getByRole('tab', { name: 'Dashboard' })).toBeTruthy());
        assertInteractiveNodesAreAccessible(toJSON());
    });
});
