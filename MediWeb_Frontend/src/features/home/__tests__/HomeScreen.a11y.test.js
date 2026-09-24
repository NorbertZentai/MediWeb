import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { ThemeContext } from 'contexts/ThemeContext';
import { AuthContext } from 'contexts/AuthContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';
import { getHomeDashboard, getPopularMedications } from '../home.api';

jest.mock('../home.api', () => ({
  getHomeDashboard: jest.fn(),
  getPopularMedications: jest.fn(),
}));

const POPULAR = [
  { id: 1, name: 'Aspirin' },
  { id: 2, name: 'Nurofen' },
];

function renderWithTheme(authValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
        <HomeScreen />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

const labelsOf = (nodes) => nodes.map((n) => n.props.accessibilityLabel);

// Issue #109: HomeScreen pressables have role, label and a >= 44x44 touch target.
describe('HomeScreen accessibility (#109)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPopularMedications.mockResolvedValue(POPULAR);
  });

  it('guest: every pressable is accessible and key buttons are reachable by role', async () => {
    await renderWithTheme({ user: null, loading: false });

    for (const med of POPULAR) {
      expect(await screen.findByRole('link', { name: med.name })).toBeTruthy();
    }
    expect(screen.getAllByRole('button', { name: 'Gyógyszer keresése' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Bejelentkezés' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Regisztráció' })).toBeTruthy();

    const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
    const labels = labelsOf(nodes);
    expect(labels).toEqual(
      expect.arrayContaining(['Gyógyszer keresése', 'Bejelentkezés', 'Regisztráció', 'Aspirin', 'Nurofen'])
    );
  });

  it('logged-in user: every pressable is accessible and key buttons are reachable by role', async () => {
    getHomeDashboard.mockResolvedValue({
      summary: {},
      popularMedications: POPULAR,
      todaysMedications: [{ profileMedicationId: 1, medicationName: 'Algopyrin', profileName: 'Anya' }],
      upcomingReminder: null,
    });

    await renderWithTheme({ user: { id: 1, name: 'Teszt Elek' }, loading: false });

    for (const med of POPULAR) {
      expect(await screen.findByRole('link', { name: med.name })).toBeTruthy();
    }
    expect(screen.getAllByRole('button', { name: 'Gyógyszer keresése' }).length).toBeGreaterThanOrEqual(1);

    const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
    const labels = labelsOf(nodes);
    expect(labels).toEqual(expect.arrayContaining(['Gyógyszer keresése', 'Aspirin', 'Nurofen']));
    expect(labels).not.toContain('Bejelentkezés');
  });
});
