import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AdminScreen from '../AdminScreen';
import { ThemeContext } from 'contexts/ThemeContext';
import { AuthContext } from 'contexts/AuthContext';
import { lightTheme } from 'styles/theme';

jest.mock('../admin.api', () => ({
    getAdminDashboard: jest.fn(() => Promise.resolve({
        totalUsers: 10, activeUsers: 8, totalMedications: 5, totalReviews: 3, uncheckedReviews: 1, reportedReviews: 0,
    })),
    getAdminUsers: jest.fn(() => Promise.resolve({ content: [], totalPages: 0 })),
    updateUserRole: jest.fn(() => Promise.resolve({})),
    toggleUserActive: jest.fn(() => Promise.resolve({})),
    deleteAdminUser: jest.fn(() => Promise.resolve({})),
    getAdminReviews: jest.fn(() => Promise.resolve({ content: [], totalPages: 0 })),
    checkReview: jest.fn(() => Promise.resolve({})),
    deleteReview: jest.fn(() => Promise.resolve({})),
    getReportedReviews: jest.fn(() => Promise.resolve({ content: [], totalPages: 0 })),
    dismissReport: jest.fn(() => Promise.resolve({})),
    getSyncConfig: jest.fn(() => Promise.resolve({
        parallelism: 4, delayMs: 100, skipRecentDays: 1, averageSecondsPerItem: 1.5, discoveryLimit: -1, persistenceChunkSize: 50,
    })),
    updateSyncConfig: jest.fn(() => Promise.resolve({})),
    getSyncStatus: jest.fn(() => Promise.resolve({ running: false, phase: 'IDLE' })),
    startSync: jest.fn(() => Promise.resolve({})),
    stopSync: jest.fn(() => Promise.resolve({})),
    startImageSync: jest.fn(() => Promise.resolve({})),
}));

function renderAdminScreen() {
    return render(
        <AuthContext.Provider value={{ user: { id: 1, name: 'Admin', role: 'ADMIN' }, loading: false }}>
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <AdminScreen />
            </ThemeContext.Provider>
        </AuthContext.Provider>
    );
}

describe('AdminScreen', () => {
    it('megjeleníti mind a négy fület magyar címkékkel', async () => {
        await renderAdminScreen();

        expect(screen.getByText('Dashboard')).toBeTruthy();
        expect(screen.getByText('Felhasználók')).toBeTruthy();
        // "Értékelések" also labels a dashboard stat card, so the tab label
        // is asserted via getAllByText rather than the single-match getByText.
        expect(screen.getAllByText('Értékelések').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Szinkron')).toBeTruthy();
    });

    it('alapértelmezetten a dashboard fület jeleníti meg', async () => {
        await renderAdminScreen();

        await waitFor(() => expect(screen.getByText('Áttekintés')).toBeTruthy());
    });

    it('a Felhasználók fülre kattintva a felhasználókezelés jelenik meg', async () => {
        await renderAdminScreen();
        await waitFor(() => expect(screen.getByText('Áttekintés')).toBeTruthy());

        await fireEvent.press(screen.getByText('Felhasználók'));

        await waitFor(() => expect(screen.getByText('Felhasználókezelés')).toBeTruthy());
        expect(screen.queryByText('Áttekintés')).toBeNull();
    });

    it('az Értékelések fülre kattintva a moderáció jelenik meg', async () => {
        await renderAdminScreen();
        await waitFor(() => expect(screen.getByText('Áttekintés')).toBeTruthy());

        // Index 0 is the tab-bar label; the dashboard's "Értékelések" stat card
        // (also matched by getAllByText) renders later in the tree.
        await fireEvent.press(screen.getAllByText('Értékelések')[0]);

        await waitFor(() => expect(screen.getByText('Értékelés moderáció')).toBeTruthy());
        expect(screen.queryByText('Áttekintés')).toBeNull();
    });

    it('a Szinkron fülre kattintva a szinkronizáció jelenik meg', async () => {
        await renderAdminScreen();
        await waitFor(() => expect(screen.getByText('Áttekintés')).toBeTruthy());

        await fireEvent.press(screen.getByText('Szinkron'));

        await waitFor(() => expect(screen.getByText('Gyógyszerbázis szinkronizáció')).toBeTruthy());
        expect(screen.queryByText('Áttekintés')).toBeNull();
    });
});
