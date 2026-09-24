import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import FavoritesScreen from '../FavoritesScreen';
import { ThemeContext } from 'contexts/ThemeContext';
import { AuthContext } from 'contexts/AuthContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';
import { getFavorites } from 'features/profile/profile.api';

jest.mock('features/profile/profile.api', () => ({
  getFavorites: jest.fn(),
  removeFromFavorites: jest.fn(),
}));
jest.mock('utils/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const FAVORITES = [
  { id: 11, medicationId: 1, medicationName: 'Aspirin' },
  { id: 12, medicationId: 2, medicationName: 'Nurofen' },
];

function renderWithTheme(authValue = { user: { id: 1, name: 'Teszt Elek' }, loading: false }) {
  return render(
    <AuthContext.Provider value={authValue}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
        <FavoritesScreen />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

const labelsOf = (nodes) => nodes.map((n) => n.props.accessibilityLabel);

// Issue #109: FavoritesScreen pressables have role, label and a >= 44x44 touch target.
describe('FavoritesScreen accessibility (#109)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('empty state: search button is accessible', async () => {
    getFavorites.mockResolvedValue([]);
    await renderWithTheme();

    expect(await screen.findByRole('button', { name: 'Gyógyszerek keresése' })).toBeTruthy();
    const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
    expect(labelsOf(nodes)).toContain('Gyógyszerek keresése');
  });

  it('list state: favourites are links with a remove button each', async () => {
    getFavorites.mockResolvedValue(FAVORITES);
    await renderWithTheme();

    for (const fav of FAVORITES) {
      expect(await screen.findByRole('link', { name: fav.medicationName })).toBeTruthy();
    }
    expect(screen.getAllByRole('button', { name: 'Eltávolítás a kedvencekből' })).toHaveLength(2);

    const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
    const labels = labelsOf(nodes);
    expect(labels).toEqual(expect.arrayContaining(['Aspirin', 'Nurofen', 'Eltávolítás a kedvencekből']));
  });

  it('confirm modal: cancel and delete buttons are accessible', async () => {
    getFavorites.mockResolvedValue(FAVORITES);
    await renderWithTheme();

    await screen.findByRole('link', { name: 'Aspirin' });
    const removeButtons = screen.getAllByRole('button', { name: 'Eltávolítás a kedvencekből' });
    await fireEvent.press(removeButtons[0]);

    expect(await screen.findByRole('button', { name: 'Mégse' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Törlés' })).toBeTruthy();

    const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
    const labels = labelsOf(nodes);
    expect(labels).toEqual(expect.arrayContaining(['Mégse', 'Törlés']));
  });
});
