jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('features/profile/profile.api', () => ({
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  updateMedicationForProfile: jest.fn(),
  removeMedicationFromProfile: jest.fn(),
  addMedicationToProfile: jest.fn(),
  getFavorites: jest.fn().mockResolvedValue([]),
}));

import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import AddProfileModal from '../profiles/AddProfileModal';
import EditProfileModal from '../profiles/EditProfileModal';
import EditMedicationModal from '../profiles/EditMedicationModal';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

const originalOS = Platform.OS;

function setPlatform(os) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

const CASES = [
  {
    name: 'AddProfileModal',
    prefix: 'add-profile',
    dialogMaxWidth: 500,
    element: () => <AddProfileModal onClose={jest.fn()} onProfileCreated={jest.fn()} />,
  },
  {
    name: 'EditProfileModal',
    prefix: 'edit-profile',
    dialogMaxWidth: 500,
    element: () => (
      <EditProfileModal profile={{ id: 1, name: 'Anna', notes: 'x' }} onClose={jest.fn()} onProfileUpdated={jest.fn()} />
    ),
  },
  {
    name: 'EditMedicationModal',
    prefix: 'edit-medication',
    dialogMaxWidth: 600,
    element: () => (
      <EditMedicationModal
        profileId={1}
        medication={{ id: 5, name: 'Aspirin', notes: '', reminders: [] }}
        onClose={jest.fn()}
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    ),
  },
];

async function renderStyles(element, prefix) {
  await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      {element}
    </ThemeContext.Provider>
  );
  return {
    container: StyleSheet.flatten(screen.getByTestId(`${prefix}-modal-container`).props.style),
    overlay: StyleSheet.flatten(screen.getByTestId(`${prefix}-modal-overlay`).props.style),
  };
}

describe('profile modals follow window width, not platform (issue #101)', () => {
  beforeEach(() => {
    useWindowDimensionsMock.mockReset();
  });

  afterEach(() => {
    setPlatform(originalOS);
  });

  CASES.forEach(({ name, prefix, dialogMaxWidth, element }) => {
    describe(name, () => {
      it('renders a centered dialog at width 1280 on ios', async () => {
        setPlatform('ios');
        mockWidth(1280);
        const { container, overlay } = await renderStyles(element(), prefix);
        expect(container.maxWidth).toBe(dialogMaxWidth);
        expect(overlay.justifyContent).toBe('center');
        expect(overlay.alignItems).toBe('center');
        expect(overlay.backgroundColor).toBe(lightTheme.components.modal.overlay);
      });

      it('renders a bottom sheet at width 375 on web', async () => {
        setPlatform('web');
        mockWidth(375);
        const { container, overlay } = await renderStyles(element(), prefix);
        expect(container.maxWidth).toBeUndefined();
        expect(overlay.justifyContent).toBe('flex-end');
        expect(overlay.backgroundColor).toBe(lightTheme.components.modal.overlay);
      });
    });
  });
});
