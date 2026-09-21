import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import OfflineCacheSection from '../OfflineCacheSection';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { getCacheInfo } from 'utils/medicationCache';

jest.mock('utils/medicationCache', () => ({
    getCacheInfo: jest.fn(),
    clearCache: jest.fn(),
}));

function renderSection() {
    return render(
        <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
            <OfflineCacheSection />
        </ThemeContext.Provider>
    );
}

describe('OfflineCacheSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('megjeleníti a mentett gyógyszerek számát egy mockolt getCacheInfo alapján', async () => {
        getCacheInfo.mockResolvedValue({ count: 7 });

        await renderSection();

        await waitFor(() => expect(screen.getByText('7 db')).toBeTruthy());
        expect(screen.getByText('Offline cache')).toBeTruthy();
    });
});
