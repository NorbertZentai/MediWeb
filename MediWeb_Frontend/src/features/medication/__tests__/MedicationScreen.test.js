jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../MedicationService', () => ({
  useMedicationService: jest.fn(),
}));

import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import { useMedicationService } from '../MedicationService';
import MedicationDetailsScreen from '../MedicationScreen';
import { createStyles } from '../MedicationScreen.style';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

const MEDICATION_DATA = {
  name: 'Teszt Gyógyszer',
  substance: 'Tesztanyag',
  atcCode: 'A01AA01',
  active: true,
  narcotic: 'nem',
  hazipatikaInfo: {},
  substitutes: [],
  packages: [],
  finalSamples: [],
  defectiveForms: [],
};

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

function mockMedicationService() {
  useMedicationService.mockReturnValue({
    data: MEDICATION_DATA,
    reviews: [],
    averageRating: 0,
    ratingDistribution: {},
    currentUser: null,
    isFavorite: false,
    favoriteId: null,
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
    <AuthContext.Provider value={{ user: null, logout: jest.fn() }}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
        <MedicationDetailsScreen />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

describe('MedicationScreen responsive breakpoint (issue #88)', () => {
  beforeEach(() => {
    mockMedicationService();
  });

  it('uses the mobile title style below the 768px breakpoint', async () => {
    mockWidth(500);
    await renderMedicationScreen();

    const title = screen.getByText('Teszt Gyógyszer');
    const flattened = StyleSheet.flatten(title.props.style);
    const expected = createStyles(lightTheme, true).title;

    expect(flattened.fontSize).toBe(expected.fontSize);
    expect(flattened.fontSize).toBe(lightTheme.fontSize.xxl);
  });

  it('uses the desktop title style at/above the 768px breakpoint', async () => {
    mockWidth(1200);
    await renderMedicationScreen();

    const title = screen.getByText('Teszt Gyógyszer');
    const flattened = StyleSheet.flatten(title.props.style);
    const expected = createStyles(lightTheme, false).title;

    expect(flattened.fontSize).toBe(expected.fontSize);
    expect(flattened.fontSize).toBe(lightTheme.fontSize.xxxl);
  });

  it('switches the title fontSize between the two widths, matching pre-refactor isMobile behaviour', async () => {
    mockWidth(500);
    await renderMedicationScreen();
    const mobileFontSize = StyleSheet.flatten(screen.getByText('Teszt Gyógyszer').props.style).fontSize;
    await screen.unmount();

    mockWidth(1200);
    await renderMedicationScreen();
    const desktopFontSize = StyleSheet.flatten(screen.getByText('Teszt Gyógyszer').props.style).fontSize;

    expect(mobileFontSize).not.toBe(desktopFontSize);
  });
});
