import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import AddProfileModal from '../profiles/AddProfileModal';
import EditProfileModal from '../profiles/EditProfileModal';
import EditMedicationModal from '../profiles/EditMedicationModal';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme, MIN_TOUCH_TARGET } from 'styles/theme';

jest.mock('features/profile/profile.api', () => ({
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  updateMedicationForProfile: jest.fn(),
  removeMedicationFromProfile: jest.fn(),
  addMedicationToProfile: jest.fn(),
  getFavorites: jest.fn().mockResolvedValue([]),
}));

function renderWithTheme(ui) {
  return render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      {ui}
    </ThemeContext.Provider>
  );
}

function expectButtonsAccessible() {
  const buttons = screen.getAllByRole('button');
  expect(buttons.length).toBeGreaterThan(0);
  buttons.forEach((el) => {
    expect(el.props.accessibilityLabel).toBeTruthy();
    const s = StyleSheet.flatten(el.props.style) || {};
    const h = el.props.hitSlop || {};
    expect(Math.max(s.minWidth || 0, s.width || 0) + (h.left || 0) + (h.right || 0)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(Math.max(s.minHeight || 0, s.height || 0) + (h.top || 0) + (h.bottom || 0)).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
}

// Issue #90: TextInputs carry their visible Hungarian label; buttons are labelled and 44x44.
describe('Profile modals accessibility (#90)', () => {
  it('AddProfileModal labels its inputs and buttons', async () => {
    await renderWithTheme(<AddProfileModal onClose={jest.fn()} onProfileCreated={jest.fn()} />);
    expect(screen.getByLabelText('Profil neve')).toBeTruthy();
    expect(screen.getByLabelText('Leírás (opcionális)')).toBeTruthy();
    expectButtonsAccessible();
  });

  it('EditProfileModal labels its inputs and buttons', async () => {
    await renderWithTheme(
      <EditProfileModal profile={{ id: 1, name: 'Anna', notes: 'x' }} onClose={jest.fn()} onProfileUpdated={jest.fn()} />
    );
    expect(screen.getByLabelText('Név')).toBeTruthy();
    expect(screen.getByLabelText('Megjegyzés')).toBeTruthy();
    expectButtonsAccessible();
  });

  it('EditMedicationModal labels its note input and buttons', async () => {
    await renderWithTheme(
      <EditMedicationModal
        profileId={1}
        medication={{ medicationId: 9, medicationName: 'Aspirin', notes: 'Reggel', reminders: [] }}
        onClose={jest.fn()}
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );
    expect(screen.getByLabelText('Megjegyzés...')).toBeTruthy();
    expectButtonsAccessible();
  });
});
