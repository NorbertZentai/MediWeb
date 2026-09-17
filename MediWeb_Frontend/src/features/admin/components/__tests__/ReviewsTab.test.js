import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ReviewsTab from '../ReviewsTab';
import { getAdminReviews, getReportedReviews } from '../../admin.api';

jest.mock('../../admin.api', () => ({
    getAdminReviews: jest.fn(),
    checkReview: jest.fn(),
    deleteReview: jest.fn(),
    getReportedReviews: jest.fn(),
    dismissReport: jest.fn(),
}));

describe('ReviewsTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getReportedReviews.mockResolvedValue({ content: [], totalPages: 0 });
    });

    it('betöltés közben a töltő állapotot jeleníti meg', async () => {
        getAdminReviews.mockReturnValue(new Promise(() => {}));

        await render(<ReviewsTab />);

        expect(screen.getByTestId('admin-loading')).toBeTruthy();
    });

    it('betöltés után megjeleníti az értékeléseket és meghívja az api-t', async () => {
        getAdminReviews.mockResolvedValue({
            content: [
                { id: 1, medicationName: 'Algopyrin', author: 'Kovács Béla', rating: 4, checked: false, positive: 'Gyors hatás' },
            ],
            totalPages: 1,
        });

        await render(<ReviewsTab />);

        await waitFor(() => expect(screen.getByText('Algopyrin')).toBeTruthy());
        expect(screen.getByText('Értékelés moderáció')).toBeTruthy();
        expect(getAdminReviews).toHaveBeenCalledTimes(1);
    });

    it('a bejelentett értékelés a magyar indoklás szöveget jeleníti meg', async () => {
        getAdminReviews.mockResolvedValue({ content: [], totalPages: 0 });
        getReportedReviews.mockResolvedValue({
            content: [
                {
                    reportId: 99,
                    reviewId: 5,
                    reason: 'INAPPROPRIATE',
                    reporterName: 'Nagy Anna',
                    reportedAt: '2024-01-01T00:00:00Z',
                    totalReports: 1,
                    medicationName: 'Algopyrin',
                    reviewAuthor: 'Kovács Béla',
                    rating: 2,
                },
            ],
            totalPages: 1,
        });

        await render(<ReviewsTab />);
        await waitFor(() => expect(screen.getByText('Értékelés moderáció')).toBeTruthy());

        await fireEvent.press(screen.getByText('Bejelentett értékelések'));

        await waitFor(() => expect(screen.getByText('Nem megfelelő tartalom')).toBeTruthy());
        expect(getReportedReviews).toHaveBeenCalled();
    });
});
