import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Navbar from '../Navbar';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

// Force the desktop layout: Navbar hides itself on mobile widths and the
// bottom tab bar takes over navigation there instead.
jest.mock('hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1280,
  }),
}));

function renderNavbar(user) {
  return render(
    <AuthContext.Provider value={{ user, logout: jest.fn() }}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
        <Navbar />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// Issue #78: Navbar.js has 13 bare TouchableOpacity elements with no
// accessibilityRole/accessibilityLabel and touch targets as small as 38x38
// (the theme toggle). These tests describe the required end state.
describe('Navbar accessibility (#78)', () => {
  it('exposes every navigation entry with accessibilityRole="link" and its visible Hungarian label', async () => {
    await renderNavbar({ id: 1, role: 'USER' });
    expect(screen.getByRole('link', { name: 'Főoldal' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Keresés' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Kedvencek' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Profil' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Beállítások' })).toBeTruthy();
  });

  it('only shows the Admin link, with accessibilityRole="link", for ADMIN users', async () => {
    await renderNavbar({ id: 1, role: 'ADMIN' });
    expect(screen.getByRole('link', { name: 'Admin' })).toBeTruthy();
  });

  it('labels the icon-only theme toggle and logo button in Hungarian', async () => {
    await renderNavbar(null);
    expect(screen.getByRole('button', { name: 'Sötét mód váltása' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'MediWeb főoldal' })).toBeTruthy();
  });

  it('gives every touchable a role, a non-empty label and a >=44x44 touch target', async () => {
    const view = await renderNavbar({ id: 1, role: 'USER' });
    assertInteractiveNodesAreAccessible(view.toJSON());
  });
});
