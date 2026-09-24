import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ReviewsTab from '../ReviewsTab';
import { getAdminReviews, getReportedReviews } from '../../admin.api';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

jest.mock('../../admin.api', () => ({
    getAdminReviews: jest.fn(),
    checkReview: jest.fn(),
    deleteReview: jest.fn(),
    getReportedReviews: jest.fn(),
    dismissReport: jest.fn(),
}));

const reviews = {
    content: [
        { id: 1, medicationName: 'Algopyrin', author: 'Kovács Béla', rating: 4, checked: false, positive: 'Gyors hatás' },
    ],
    totalPages: 3,
};
const reported = {
    content: [
        {
            reportId: 99, reviewId: 5, reason: 'INAPPROPRIATE', reporterName: 'Nagy Anna',
            reportedAt: '2024-01-01T00:00:00Z', totalReports: 1, medicationName: 'Nurofen',
            reviewAuthor: 'Szabó Éva', rating: 2,
        },
    ],
    totalPages: 2,
};

async function renderTab() {
    getAdminReviews.mockResolvedValue(reviews);
    getReportedReviews.mockResolvedValue(reported);
    const r = await render(<ReviewsTab />);
    await waitFor(() => expect(screen.getByText('Algopyrin')).toBeTruthy());
    return r;
}

async function expandReported() {
    await fireEvent.press(screen.getByRole('button', { name: 'Bejelentett értékelések' }));
    await waitFor(() => expect(screen.getByText('Nurofen')).toBeTruthy());
}

const selectedOf = (name) => screen.getByRole('button', { name }).props.accessibilityState;

describe('ReviewsTab a11y', () => {
    beforeEach(() => jest.clearAllMocks());

    it('a szűrő gombok kiválasztott állapota követi a szűrőt és újratölt', async () => {
        await renderTab();
        expect(selectedOf('Ellenőrizetlen')).toMatchObject({ selected: true });
        expect(selectedOf('Összes')).toMatchObject({ selected: false });
        await fireEvent.press(screen.getByRole('button', { name: 'Összes' }));
        await waitFor(() => expect(getAdminReviews).toHaveBeenCalledTimes(2));
        expect(getAdminReviews).toHaveBeenLastCalledWith({ checked: undefined, page: 0, size: 15 });
        expect(selectedOf('Összes')).toMatchObject({ selected: true });
        expect(selectedOf('Ellenőrizetlen')).toMatchObject({ selected: false });
    });

    it('a bejelentett fejléc expanded állapota váltakozik', async () => {
        await renderTab();
        expect(selectedOf('Bejelentett értékelések')).toMatchObject({ expanded: false });
        await expandReported();
        expect(selectedOf('Bejelentett értékelések')).toMatchObject({ expanded: true });
    });

    it('a bejelentés és értékelés műveletek címkét kapnak', async () => {
        await renderTab();
        await expandReported();
        expect(screen.getByRole('button', { name: 'Bejelentés elutasítása' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Megjelölés ellenőrzöttként' })).toBeTruthy();
        expect(screen.getAllByRole('button', { name: 'Értékelés törlése' })).toHaveLength(2);
    });

    it('a lapozók száma megegyezik a látható blokkokéval', async () => {
        await renderTab();
        expect(screen.getAllByRole('button', { name: 'Előző oldal' })).toHaveLength(1);
        await expandReported();
        expect(screen.getAllByRole('button', { name: 'Előző oldal' })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Következő oldal' })).toHaveLength(2);
    });

    it('összecsukott nézetben minden interaktív elem hozzáférhető', async () => {
        const { toJSON } = await renderTab();
        assertInteractiveNodesAreAccessible(toJSON());
    });

    it('kibontott nézetben minden interaktív elem hozzáférhető', async () => {
        const { toJSON } = await renderTab();
        await expandReported();
        assertInteractiveNodesAreAccessible(toJSON());
    });
});
