import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DataSection from '../DataSection';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

const preferences = {
    data: { anonymizedAnalytics: true },
};

describe('DataSection', () => {
    it('megjeleníti az "Adatkezelés" fejlécet és csak az anonimizált analitika kapcsolót', async () => {
        const onToggle = jest.fn(() => jest.fn());
        const view = await render(
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <DataSection preferences={preferences} onToggle={onToggle} />
            </ThemeContext.Provider>
        );

        expect(screen.getByText('Adatkezelés')).toBeTruthy();
        expect(view.getAllByRole('switch')).toHaveLength(1);
    });

    it('a kapcsoló átbillentésekor az onToggle-t hívja az új értékkel', async () => {
        const changeHandler = jest.fn();
        const onToggle = jest.fn(() => changeHandler);

        const view = await render(
            <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
                <DataSection preferences={preferences} onToggle={onToggle} />
            </ThemeContext.Provider>
        );

        const [switchEl] = view.getAllByRole('switch');
        await fireEvent(switchEl, 'valueChange', false);

        expect(onToggle).toHaveBeenCalledWith('data', 'anonymizedAnalytics');
        expect(changeHandler).toHaveBeenCalledWith(false);
    });
});
