import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import SyncTab from '../SyncTab';
import { getSyncStatus, getSyncConfig } from '../../admin.api';

jest.mock('../../admin.api', () => ({
    getSyncConfig: jest.fn(),
    updateSyncConfig: jest.fn(),
    getSyncStatus: jest.fn(),
    startSync: jest.fn(),
    stopSync: jest.fn(),
    startImageSync: jest.fn(),
}));

describe('SyncTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('betöltés közben a töltő állapotot jeleníti meg', async () => {
        getSyncStatus.mockReturnValue(new Promise(() => {}));
        getSyncConfig.mockReturnValue(new Promise(() => {}));

        await render(<SyncTab />);

        expect(screen.getByTestId('admin-loading')).toBeTruthy();
    });

    it('betöltés után megjeleníti az állapotot és meghívja a sync api-kat', async () => {
        getSyncStatus.mockResolvedValue({ running: false, phase: 'IDLE', finishedAt: null });
        getSyncConfig.mockResolvedValue({
            parallelism: 4, delayMs: 100, skipRecentDays: 1, averageSecondsPerItem: 1.5, discoveryLimit: -1, persistenceChunkSize: 50,
        });

        await render(<SyncTab />);

        await waitFor(() => expect(screen.getByText('Gyógyszerbázis szinkronizáció')).toBeTruthy());
        expect(screen.getByText(/Inaktív/)).toBeTruthy();
        expect(getSyncStatus).toHaveBeenCalledTimes(1);
        expect(getSyncConfig).toHaveBeenCalledTimes(1);
    });
});
