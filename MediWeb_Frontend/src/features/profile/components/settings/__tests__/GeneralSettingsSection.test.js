import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GeneralSettingsSection from '../GeneralSettingsSection';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

const preferences = {
    general: {
        language: 'hu',
        theme: 'system',
        timezone: 'Europe/Budapest',
        dailyDigestHour: '08:00',
    },
};

function renderSection({ onSelect = jest.fn(), onInputChange = jest.fn() } = {}) {
    return render(
        <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
            <GeneralSettingsSection preferences={preferences} onSelect={onSelect} onInputChange={onInputChange} />
        </ThemeContext.Provider>
    );
}

describe('GeneralSettingsSection', () => {
    it('megjeleníti az "Általános beállítások" fejlécet', async () => {
        await renderSection();
        expect(screen.getByText('Általános beállítások')).toBeTruthy();
    });

    it('egy pill kiválasztásakor az onSelect-et hívja a szekcióval, kulccsal és az új értékkel', async () => {
        const onSelect = jest.fn();
        await renderSection({ onSelect });

        await fireEvent.press(screen.getByText('Sötét'));

        expect(onSelect).toHaveBeenCalledWith('general', 'theme', 'dark');
    });
});
