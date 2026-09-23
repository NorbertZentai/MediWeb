import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import IntakeTab from '../IntakeTab';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme, MIN_TOUCH_TARGET } from 'styles/theme';
import { getProfilesForUser, getTodaysMedications, submitIntake } from 'features/profile/profile.api';

jest.mock('features/profile/profile.api', () => ({
  getProfilesForUser: jest.fn(),
  getTodaysMedications: jest.fn(),
  submitIntake: jest.fn(),
}));

function size(el) {
  const s = StyleSheet.flatten(el.props.style) || {};
  const h = el.props.hitSlop || {};
  return {
    w: Math.max(s.minWidth || 0, s.width || 0) + (h.left || 0) + (h.right || 0),
    h: Math.max(s.minHeight || 0, s.height || 0) + (h.top || 0) + (h.bottom || 0),
  };
}

function renderIntakeTab() {
  return render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <IntakeTab />
    </ThemeContext.Provider>
  );
}

// Issue #90: intake controls expose role, Hungarian label, checked state and 44x44 target.
describe('IntakeTab accessibility (#90)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getProfilesForUser.mockResolvedValue([{ id: 1, name: 'Anna' }]);
    let taken = false;
    getTodaysMedications.mockImplementation(async () => [
      { profileMedicationId: 5, medicationName: 'Aspirin', times: ['23:59'], takenFlags: [taken] },
    ]);
    submitIntake.mockImplementation(async () => {
      taken = true;
      return {};
    });
  });

  it('exposes the intake toggle as a checkbox whose checked state flips after pressing', async () => {
    await renderIntakeTab();
    const box = await screen.findByRole('checkbox');
    expect(box.props.accessibilityLabel).toBeTruthy();
    expect(box.props.accessibilityState?.checked).toBe(false);

    await fireEvent.press(box);

    await waitFor(() =>
      expect(screen.getByRole('checkbox').props.accessibilityState?.checked).toBe(true)
    );
    expect(submitIntake).toHaveBeenCalledWith({ profileMedicationId: 5, time: '23:59', taken: true });
  });

  it('gives every button a label and a 44x44 touch target', async () => {
    await renderIntakeTab();
    await screen.findByRole('checkbox');
    const controls = [...screen.getAllByRole('button'), ...screen.getAllByRole('checkbox')];
    expect(controls.length).toBeGreaterThan(1);
    controls.forEach((el) => {
      expect(el.props.accessibilityLabel).toBeTruthy();
      const { w, h } = size(el);
      expect(w).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      expect(h).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    });
  });
});
