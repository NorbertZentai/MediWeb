import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';
import { ThemeContext } from 'contexts/ThemeContext';
import { AuthContext } from 'contexts/AuthContext';
import { lightTheme } from 'styles/theme';

jest.mock('../profile.api', () => ({
  fetchCurrentUser: jest.fn().mockResolvedValue({ name: 'Teszt Elek', email: 't@e.hu', imageUrl: null }),
  getFavorites: jest.fn().mockResolvedValue([]),
  getUserReviews: jest.fn().mockResolvedValue([]),
}));
jest.mock('utils/recentlyViewed', () => ({
  getRecentlyViewed: jest.fn().mockResolvedValue([]),
}));

function renderWithTheme(authValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
        <ProfileScreen />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// Issue #90: every ProfileScreen button is reachable by role and has a Hungarian label.
describe('ProfileScreen accessibility (#90)', () => {
  it('logged-in user: every button has a label', async () => {
    await renderWithTheme({ logout: jest.fn(), user: { id: 1, name: 'Teszt Elek' } });
    await screen.findByText('Fiók adatok');
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(3);
    buttons.forEach((el) => expect(el.props.accessibilityLabel).toBeTruthy());
    expect(screen.getByRole('button', { name: /Fiók adatok/ })).toBeTruthy();
  });

  it('guest: login and register buttons are reachable by role', async () => {
    await renderWithTheme({ logout: jest.fn(), user: null });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((el) => expect(el.props.accessibilityLabel).toBeTruthy());
  });
});
