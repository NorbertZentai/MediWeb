import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AccountActionsSection from '../AccountActionsSection';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { exportDataDirect } from 'features/profile/profile.api';
import { showConfirm } from 'utils/dialogs';

jest.mock('expo-file-system', () => ({
    documentDirectory: 'file:///mock/',
    EncodingType: { UTF8: 'utf8' },
    writeAsStringAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn(() => Promise.resolve(false)),
    shareAsync: jest.fn(() => Promise.resolve()),
}));

// requestAccountDeletion is mocked only in this test file, as jest.fn(). It is
// NOT exported by profile.api.js on origin/ai/demo (pre-existing GDPR defect,
// verified via `grep -n requestAccountDeletion src/features/profile/profile.api.js`
// → no match). The component must keep calling it exactly as it did before the
// split; this mock does not paper over the missing real implementation.
jest.mock('features/profile/profile.api', () => ({
    requestAccountDeletion: jest.fn(),
    exportDataDirect: jest.fn(),
}));

jest.mock('utils/dialogs', () => ({
    showAlert: jest.fn(),
    showConfirm: jest.fn(),
}));

function renderSection() {
    return render(
        <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
            <AccountActionsSection />
        </ThemeContext.Provider>
    );
}

describe('AccountActionsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('az "Adatok exportálása" gombra kattintva egyszer hívja az export api-t', async () => {
        exportDataDirect.mockResolvedValue({ some: 'data' });

        await renderSection();
        await fireEvent.press(screen.getByText('Adatok exportálása'));

        await waitFor(() => expect(exportDataDirect).toHaveBeenCalledTimes(1));
    });

    it('a törlés a showConfirm onConfirm meghívásáig nem hívja a requestAccountDeletion-t', async () => {
        const { requestAccountDeletion } = require('features/profile/profile.api');

        await renderSection();
        await fireEvent.press(screen.getByText('Fiók törlése'));

        expect(showConfirm).toHaveBeenCalledTimes(1);
        expect(requestAccountDeletion).not.toHaveBeenCalled();

        const [, , options] = showConfirm.mock.calls[0];
        expect(options.confirmText).toBe('Törlés');
        expect(options.destructive).toBe(true);

        await options.onConfirm();

        expect(requestAccountDeletion).toHaveBeenCalledTimes(1);
    });
});
