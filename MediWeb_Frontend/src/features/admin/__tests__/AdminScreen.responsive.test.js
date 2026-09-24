jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('../admin.api', () => ({
    getAdminDashboard: jest.fn(),
}));

import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import DashboardTab from '../components/DashboardTab';
import { getAdminDashboard } from '../admin.api';

function mockWidth(width) {
    useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

async function renderStatCardStyle() {
    await render(<DashboardTab />);
    const card = await screen.findByTestId('admin-stat-card-0');
    return StyleSheet.flatten(card.props.style);
}

describe('admin layout follows window width, not platform (issue #100)', () => {
    beforeEach(() => {
        useWindowDimensionsMock.mockReset();
        getAdminDashboard.mockReset();
        getAdminDashboard.mockResolvedValue({
            totalUsers: 42,
            activeUsers: 30,
            totalMedications: 12,
            totalReviews: 7,
            uncheckedReviews: 2,
            reportedReviews: 1,
        });
    });

    it('runs with Platform.OS ios', () => {
        expect(Platform.OS).toBe('ios');
    });

    it('width 1280 produces the desktop stat card layout', async () => {
        mockWidth(1280);
        const style = await renderStatCardStyle();
        expect(style.minWidth).toBe(170);
        expect(style.flex).toBeUndefined();
    });

    it('width 375 produces the mobile stat card layout', async () => {
        mockWidth(375);
        const style = await renderStatCardStyle();
        expect(style.minWidth).toBe('46%');
        expect(style.flex).toBe(1);
    });
});
