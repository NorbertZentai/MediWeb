import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import CustomDropdown from '../CustomDropdown';
import GuestLoginBanner from '../GuestLoginBanner';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

// Issue #89: the CustomDropdown trigger must expose accessibilityRole="button"
// and accessibilityState.expanded reflecting the open state, each option must
// expose accessibilityRole="menuitem" and accessibilityState.selected, and the
// GuestLoginBanner login CTA must be reachable by role and by its Hungarian
// name ("Bejelentkezés").

const OPTIONS = [
  { label: 'Első', value: 1 },
  { label: 'Második', value: 2 },
];

async function renderDropdown(selectedValue = null) {
  return await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
      <CustomDropdown options={OPTIONS} selectedValue={selectedValue} onValueChange={jest.fn()} placeholder="Válassz..." />
    </ThemeContext.Provider>
  );
}

describe('CustomDropdown accessibility (#89)', () => {
  it('exposes the trigger as accessibilityRole="button" with accessibilityState.expanded=false when closed', async () => {
    await renderDropdown();

    const trigger = screen.getByRole('button', { name: 'Válassz...' });
    expect(trigger.props.accessibilityState).toEqual(
      expect.objectContaining({ expanded: false })
    );
  });

  it('flips accessibilityState.expanded to true after the trigger is pressed', async () => {
    await renderDropdown();

    await fireEvent.press(screen.getByRole('button', { name: 'Válassz...' }));
    await waitFor(() => expect(screen.getByText('Első')).toBeTruthy());

    const trigger = screen.getByRole('button', { name: 'Válassz...' });
    expect(trigger.props.accessibilityState).toEqual(
      expect.objectContaining({ expanded: true })
    );
  });

  it('exposes each option as accessibilityRole="menuitem" and marks the selected one', async () => {
    await renderDropdown(2);

    await fireEvent.press(screen.getByRole('button', { name: 'Második' }));
    await waitFor(() => expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0));

    const options = screen.getAllByRole('menuitem');
    expect(options).toHaveLength(2);

    const selectedOption = screen.getByRole('menuitem', { name: 'Második' });
    expect(selectedOption.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true })
    );

    const unselectedOption = screen.getByRole('menuitem', { name: 'Első' });
    expect(unselectedOption.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false })
    );
  });
});

describe('GuestLoginBanner accessibility (#89)', () => {
  it('exposes the login CTA by role and by the "Bejelentkezés" name', async () => {
    await render(<GuestLoginBanner />);

    expect(screen.getByRole('button', { name: 'Bejelentkezés' })).toBeTruthy();
  });
});
