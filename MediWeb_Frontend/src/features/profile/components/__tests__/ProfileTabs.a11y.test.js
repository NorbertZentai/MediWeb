import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ProfileTabs from '../ProfileTabs';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

function renderTabs(selectedTab) {
  return render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <ProfileTabs selectedTab={selectedTab} onTabChange={jest.fn()} />
    </ThemeContext.Provider>
  );
}

// Issue #78: ProfileTabs.js tab buttons must use accessibilityRole="tab" and
// accessibilityState={{ selected: isActive }}.
describe('ProfileTabs accessibility (#78)', () => {
  it('exposes each tab with accessibilityRole="tab" and its visible Hungarian label', async () => {
    await renderTabs('profiles');
    expect(screen.getByRole('tab', { name: 'Profilok' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Kedvencek' })).toBeTruthy();
  });

  it('marks only the active tab as accessibilityState.selected = true', async () => {
    await renderTabs('favorites');
    const active = screen.getByRole('tab', { name: 'Kedvencek' });
    const inactive = screen.getByRole('tab', { name: 'Profilok' });
    expect(active.props.accessibilityState?.selected).toBe(true);
    expect(inactive.props.accessibilityState?.selected).toBe(false);
  });
});
