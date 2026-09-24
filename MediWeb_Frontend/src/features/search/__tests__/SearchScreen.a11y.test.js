jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../SearchService', () => ({
  useSearchService: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: require('react-native').View,
}));
jest.mock('utils/haptics', () => ({ haptics: { light: jest.fn(), medium: jest.fn() } }));

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';
import { useSearchService } from '../SearchService';
import SearchScreen from '../SearchScreen';

const MOBILE = 375;
const DESKTOP = 1280;

const DEFAULT_FILTERS = {
  atcCode: '',
  registrationNumber: '',
  authorisationDateFrom: '',
  authorisationDateTo: '',
  revokeDateFrom: '',
  revokeDateTo: '',
  lactoseFree: false,
  glutenFree: false,
  benzoateFree: false,
  narcoticOnly: false,
  hasFinalSample: false,
  hasDefectedForm: false,
  fokozottFelugyelet: false,
};

const MEDICATIONS = [
  { id: 1, name: 'Teszt Gyógyszer A', substance: 'Anyag A', company: 'Cég A', status: 'Törzskönyvezett', active: true },
  { id: 2, name: 'Teszt Gyógyszer B', substance: 'Anyag B', company: 'Cég B', status: 'Törzskönyvezett', active: true },
];

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

function mockSearch(overrides = {}) {
  useSearchService.mockReturnValue({
    searchQuery: '',
    setSearchQuery: jest.fn(),
    filters: DEFAULT_FILTERS,
    handleFilterChange: jest.fn(),
    results: [],
    totalCount: 0,
    handleSearch: jest.fn(),
    loading: false,
    viewMode: 'list',
    setViewMode: jest.fn(),
    loadMore: jest.fn(),
    hasMore: false,
    ...overrides,
  });
}

async function renderSearchScreen() {
  return await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
      <SearchScreen />
    </ThemeContext.Provider>
  );
}

describe('SearchScreen accessibility (#110)', () => {
  describe.each([
    ['mobile', MOBILE],
    ['desktop', DESKTOP],
  ])('at %s width (%i)', (_name, width) => {
    beforeEach(() => {
      mockWidth(width);
    });

    it('idle state: every pressable is accessible and the search input is labelled', async () => {
      mockSearch();
      await renderSearchScreen();

      assertInteractiveNodesAreAccessible(screen.toJSON());
      expect(screen.getByLabelText('Gyógyszer neve')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Szűrők megnyitása' })).toBeTruthy();
    });

    it('idle state with a query and an active filter: clear button and filter chips are accessible', async () => {
      mockSearch({
        searchQuery: 'para',
        filters: { ...DEFAULT_FILTERS, lactoseFree: true, atcCode: 'N02' },
      });
      await renderSearchScreen();

      const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
      const labels = nodes.map((n) => n.props.accessibilityLabel);
      expect(labels).toEqual(expect.arrayContaining([
        'Keresés törlése',
        'Laktózmentes szűrő eltávolítása',
        'ATC: N02 szűrő eltávolítása',
        'Összes szűrő törlése',
        'Szűrők törlése',
      ]));
      expect(screen.getByLabelText('Gyógyszer neve')).toBeTruthy();
    });

    it.each(['grid', 'list'])('results state in %s view: every pressable is accessible', async (viewMode) => {
      mockSearch({ results: MEDICATIONS, totalCount: 2, viewMode, hasMore: true, searchQuery: 'teszt' });
      await renderSearchScreen();

      const nodes = assertInteractiveNodesAreAccessible(screen.toJSON());
      expect(screen.getByLabelText('Gyógyszer neve')).toBeTruthy();
      MEDICATIONS.forEach((med) => {
        expect(screen.getByRole('link', { name: med.name })).toBeTruthy();
      });
      expect(nodes.map((n) => n.props.accessibilityLabel)).toContain('További találatok betöltése');
    });
  });

  it('opens the filter control by name on mobile and hides the view toggles', async () => {
    mockWidth(MOBILE);
    mockSearch({ results: MEDICATIONS, totalCount: 2, viewMode: 'grid' });
    await renderSearchScreen();

    expect(screen.getByRole('button', { name: 'Szűrők megnyitása' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Rács nézet' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Lista nézet' })).toBeNull();
  });

  it.each([
    ['grid', true, false],
    ['list', false, true],
  ])('exposes the active view on the toggles at desktop width (%s)', async (viewMode, gridSelected, listSelected) => {
    mockWidth(DESKTOP);
    mockSearch({ results: MEDICATIONS, totalCount: 2, viewMode });
    await renderSearchScreen();

    expect(screen.getByRole('button', { name: 'Rács nézet' }).props.accessibilityState.selected).toBe(gridSelected);
    expect(screen.getByRole('button', { name: 'Lista nézet' }).props.accessibilityState.selected).toBe(listSelected);
  });
});
