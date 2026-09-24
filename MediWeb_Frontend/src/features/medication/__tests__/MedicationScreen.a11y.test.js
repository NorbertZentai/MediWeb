jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../MedicationService', () => ({
  useMedicationService: jest.fn(),
}));

jest.mock('features/profile/profile.api', () => ({
  addToFavorites: jest.fn(),
  removeFromFavorites: jest.fn(),
  addMedicationToProfile: jest.fn(),
  getMedicationsForProfile: jest.fn().mockResolvedValue([]),
}));
jest.mock('features/review/review.api', () => ({
  submitReview: jest.fn(),
  updateReview: jest.fn(),
}));
jest.mock('utils/medicationCache', () => ({ saveMedication: jest.fn().mockResolvedValue(undefined) }));
jest.mock('utils/recentlyViewed', () => ({ addRecentlyViewed: jest.fn().mockResolvedValue(undefined) }));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import { useMedicationService } from '../MedicationService';
import MedicationDetailsScreen from '../MedicationScreen';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

const MOBILE = 375;
const DESKTOP = 1280;

const MEDICATION_DATA = {
  name: 'Teszt Gyógyszer',
  substance: 'Tesztanyag',
  atcCode: 'A01AA01',
  company: 'Teszt Kft.',
  status: 'Törzskönyvezett',
  registrationNumber: 'OGYI-T-0001/01',
  active: true,
  narcotic: 'nem',
  hazipatikaInfo: {
    sections: [
      { heading: 'Lehetséges mellékhatások', html: '<p>Fejfájás</p>' },
      { heading: 'Hogyan kell alkalmazni', html: '<p>Naponta egyszer</p>' },
      { heading: 'Mi ez a gyógyszer', html: '<p>Fájdalomcsillapító</p>' },
    ],
  },
  substitutes: [{ itemId: 2, name: 'Helyettesítő', registrationNumber: 'OGYI-T-0002/01' }],
  packages: [{ name: '20x doboz', registrationNumber: 'OGYI-T-0001/01' }],
  finalSamples: [{ packageDescription: 'Végleges minta', decisionDate: '2024-01-01' }],
  defectiveForms: [{ packageDescription: 'Hibás forma', decisionDate: '2024-02-01' }],
};

const ACCORDION_TITLES = [
  'Alapadatok',
  'Helyettesítő készítmények',
  'Kiszerelések',
  'Lehetséges mellékhatások',
  'Hogyan kell alkalmazni?',
  'Teljes betegtájékoztató',
  'Véglegminták',
  'Alaki hibák',
];

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

function mockMedicationService({ isFavorite = false } = {}) {
  useMedicationService.mockReturnValue({
    data: MEDICATION_DATA,
    reviews: [],
    averageRating: 0,
    ratingDistribution: {},
    currentUser: { id: 1 },
    isFavorite,
    favoriteId: isFavorite ? 5 : null,
    profiles: [],
    loading: false,
    isOffline: false,
    setIsFavorite: jest.fn(),
    fetchReviews: jest.fn(),
    setFavoriteId: jest.fn(),
  });
}

async function renderMedicationScreen() {
  return await render(
    <AuthContext.Provider value={{ user: { id: 1 }, loading: false, logout: jest.fn() }}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
        <MedicationDetailsScreen />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// Collapsible section headers (Accordion). Dropdown triggers also expose `expanded`, so they are excluded by title.
const accordionHeaders = (nodes) =>
  nodes.filter(
    (n) => ACCORDION_TITLES.includes(n.props.accessibilityLabel) && n.props.accessibilityState?.expanded !== undefined
  );

describe('MedicationScreen accessibility (#110)', () => {
  describe.each([
    ['mobile', MOBILE],
    ['desktop', DESKTOP],
  ])('logged in at %s width (%i)', (_name, width) => {
    beforeEach(() => {
      mockWidth(width);
      mockMedicationService();
    });

    it('every pressable has a role, a label and a 44x44 touch target', async () => {
      await renderMedicationScreen();

      assertInteractiveNodesAreAccessible(screen.toJSON());
      expect(screen.getByRole('button', { name: 'Vissza' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Hozzáadás a profilhoz' })).toBeTruthy();
    });

    it('exposes a boolean expanded state on every collapsible header and flips it on press', async () => {
      await renderMedicationScreen();

      const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
      const headers = accordionHeaders(nodes);
      expect(headers.length).toBeGreaterThanOrEqual(2);
      expect(headers.map((h) => h.props.accessibilityLabel)).toEqual(ACCORDION_TITLES);

      for (const title of ACCORDION_TITLES) {
        const before = screen.getByRole('button', { name: title }).props.accessibilityState.expanded;
        expect(typeof before).toBe('boolean');

        await fireEvent.press(screen.getByRole('button', { name: title }));

        const after = screen.getByRole('button', { name: title }).props.accessibilityState.expanded;
        expect(after).toBe(!before);
      }

      // Everything is expanded now: the expanded bodies must still pass the walker.
      assertInteractiveNodesAreAccessible(screen.toJSON());
    });
  });

  it('labels the favourite toggle "Hozzáadás a kedvencekhez" when not a favourite', async () => {
    mockWidth(MOBILE);
    mockMedicationService({ isFavorite: false });
    await renderMedicationScreen();

    expect(screen.getByRole('button', { name: 'Hozzáadás a kedvencekhez' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Eltávolítás a kedvencekből' })).toBeNull();
  });

  it('labels the favourite toggle "Eltávolítás a kedvencekből" when a favourite', async () => {
    mockWidth(MOBILE);
    mockMedicationService({ isFavorite: true });
    await renderMedicationScreen();

    expect(screen.getByRole('button', { name: 'Eltávolítás a kedvencekből' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Hozzáadás a kedvencekhez' })).toBeNull();
  });
});
