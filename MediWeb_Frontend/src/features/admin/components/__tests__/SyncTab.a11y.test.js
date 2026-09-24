import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import SyncTab from '../SyncTab';
import { getSyncStatus, getSyncConfig } from '../../admin.api';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

jest.mock('../../admin.api', () => ({
    getSyncConfig: jest.fn(),
    updateSyncConfig: jest.fn(),
    getSyncStatus: jest.fn(),
    startSync: jest.fn(),
    stopSync: jest.fn(),
    startImageSync: jest.fn(),
}));

async function renderTab() {
    getSyncStatus.mockResolvedValue({ running: false, phase: 'IDLE', finishedAt: null });
    getSyncConfig.mockResolvedValue({
        parallelism: 4, delayMs: 100, skipRecentDays: 1, averageSecondsPerItem: 1.5, discoveryLimit: -1, persistenceChunkSize: 50,
    });
    const r = await render(<SyncTab />);
    await waitFor(() => expect(screen.getByText('Gyógyszerbázis szinkronizáció')).toBeTruthy());
    return r;
}

describe('SyncTab a11y', () => {
    beforeEach(() => jest.clearAllMocks());

    it('az akciógombok button szerepkört és címkét kapnak', async () => {
        await renderTab();
        for (const name of ['Szinkron indítás', 'Kényszerített', 'Hiányzó képek', 'Képek + cleanup', 'Beállítások mentése']) {
            expect(screen.getByRole('button', { name })).toBeTruthy();
        }
    });

    it('a mentés gomb disabled állapota a saving-et tükrözi', async () => {
        await renderTab();
        const save = screen.getByRole('button', { name: 'Beállítások mentése' });
        expect(save.props.accessibilityState).toEqual(expect.objectContaining({ disabled: false }));
    });

    it('minden interaktív elem hozzáférhető', async () => {
        const { toJSON } = await renderTab();
        assertInteractiveNodesAreAccessible(toJSON());
    });

    it('a konfigurációs mezők a látható címkéjükön megtalálhatók', async () => {
        await renderTab();
        expect(screen.getByLabelText('Párhuzamosság (szálak)')).toBeTruthy();
        expect(screen.getByLabelText('Késleltetés (ms)')).toBeTruthy();
    });
});
