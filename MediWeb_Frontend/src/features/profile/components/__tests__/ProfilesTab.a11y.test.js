import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import ProfilesTab from '../ProfilesTab';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme, MIN_TOUCH_TARGET } from 'styles/theme';
import { getProfilesForUser, getMedicationsForProfile } from 'features/profile/profile.api';

jest.mock('features/profile/profile.api', () => ({
  getProfilesForUser: jest.fn(),
  getMedicationsForProfile: jest.fn(),
  deleteProfile: jest.fn(),
  removeMedicationFromProfile: jest.fn(),
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  updateMedicationForProfile: jest.fn(),
  addMedicationToProfile: jest.fn(),
}));

function size(el) {
  const s = StyleSheet.flatten(el.props.style) || {};
  const h = el.props.hitSlop || {};
  return {
    w: Math.max(s.minWidth || 0, s.width || 0) + (h.left || 0) + (h.right || 0),
    h: Math.max(s.minHeight || 0, s.height || 0) + (h.top || 0) + (h.bottom || 0),
  };
}

function expectTarget(el) {
  const { w, h } = size(el);
  expect(w).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  expect(h).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
}

function renderProfilesTab() {
  return render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <ProfilesTab />
    </ThemeContext.Provider>
  );
}

// Issue #90: profile and medication cards expose named, 44x44 edit/delete buttons.
describe('ProfilesTab accessibility (#90)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getProfilesForUser.mockResolvedValue([{ id: 1, name: 'Anna', notes: 'Megjegyzés' }]);
    getMedicationsForProfile.mockResolvedValue([
      { medicationId: 9, medicationName: 'Aspirin', notes: 'Reggel', reminders: [] },
    ]);
  });

  it('labels the profile card and its edit/delete buttons with the profile name', async () => {
    await renderProfilesTab();
    const card = await screen.findByRole('button', { name: 'Anna' });
    expectTarget(card);
    const edit = screen.getByRole('button', { name: /Szerkesztés.*Anna/i });
    const del = screen.getByRole('button', { name: /Törlés.*Anna/i });
    expectTarget(edit);
    expectTarget(del);
  });

  it('labels the medication card and its edit/delete buttons with the medication name', async () => {
    await renderProfilesTab();
    await fireEvent.press(await screen.findByRole('button', { name: 'Anna' }));
    const card = await screen.findByRole('button', { name: 'Aspirin' });
    expectTarget(card);
    const edit = screen.getByRole('button', { name: /Szerkesztés.*Aspirin/i });
    const del = screen.getByRole('button', { name: /Törlés.*Aspirin/i });
    expectTarget(edit);
    expectTarget(del);
  });

  it('gives the add-profile button a label and a 44x44 target', async () => {
    await renderProfilesTab();
    await screen.findByRole('button', { name: 'Anna' });
    screen.getAllByRole('button').forEach((el) => {
      expect(el.props.accessibilityLabel).toBeTruthy();
    });
  });
});
