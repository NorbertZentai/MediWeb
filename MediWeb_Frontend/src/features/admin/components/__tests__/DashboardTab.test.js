import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import DashboardTab from '../DashboardTab';
import { getAdminDashboard } from '../../admin.api';

jest.mock('../../admin.api', () => ({
    getAdminDashboard: jest.fn(),
}));

describe('DashboardTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('betöltés közben a töltő állapotot jeleníti meg', async () => {
        getAdminDashboard.mockReturnValue(new Promise(() => {})); // never resolves

        await render(<DashboardTab />);

        expect(screen.getByTestId('admin-loading')).toBeTruthy();
    });

    it('betöltés után megjeleníti a statisztikákat és meghívja a dashboard api-t', async () => {
        getAdminDashboard.mockResolvedValue({
            totalUsers: 42,
            activeUsers: 30,
            totalMedications: 12,
            totalReviews: 7,
            uncheckedReviews: 2,
            reportedReviews: 1,
        });

        await render(<DashboardTab />);

        await waitFor(() => expect(screen.getByText('42')).toBeTruthy());
        expect(screen.getByText('Áttekintés')).toBeTruthy();
        expect(screen.getByText('Összes felhasználó')).toBeTruthy();
        expect(getAdminDashboard).toHaveBeenCalledTimes(1);
    });
});
