import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import NotificationSettingsSection from '../NotificationSettingsSection';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

const preferences = {
    notifications: {
        medicationReminders: true,
        summaryEmails: true,
        refillAlerts: false,
        pushEnabled: true,
    },
};

function renderSection(onToggle) {
    return render(
        <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
            <NotificationSettingsSection preferences={preferences} onToggle={onToggle} />
        </ThemeContext.Provider>
    );
}

describe('NotificationSettingsSection', () => {
    it('megjeleníti az "Értesítési beállítások" fejlécet', async () => {
        const onToggle = jest.fn(() => jest.fn());
        await renderSection(onToggle);

        expect(screen.getByText('Értesítési beállítások')).toBeTruthy();
    });

    it('egy kapcsoló átbillentésekor az onToggle-t hívja a szekcióval/kulccsal, és az így kapott callback az új értékkel fut le', async () => {
        const changeHandler = jest.fn();
        const onToggle = jest.fn(() => changeHandler);

        const view = await renderSection(onToggle);
        const switches = view.getAllByRole('switch');
        await fireEvent(switches[0], 'valueChange', false);

        expect(onToggle).toHaveBeenCalledWith('notifications', 'medicationReminders');
        expect(changeHandler).toHaveBeenCalledWith(false);
    });
});
