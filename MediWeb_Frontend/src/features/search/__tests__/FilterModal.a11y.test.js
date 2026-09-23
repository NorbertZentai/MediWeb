import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import FilterModal from '../FilterModal';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: require('react-native').View,
}));
jest.mock('utils/haptics', () => ({ haptics: { light: jest.fn(), medium: jest.fn() } }));

const base = { hasFinalSample: false, lactoseFree: true, atcCode: '', registrationNumber: '' };
const renderModal = (props = {}) =>
  render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <FilterModal visible onClose={jest.fn()} onReset={jest.fn()} onFilterChange={jest.fn()} filters={base} {...props} />
    </ThemeContext.Provider>
  );

describe('FilterModal accessibility (#92)', () => {
  it('exposes boolean filters as checkboxes whose checked state reflects selection', async () => {
    await renderModal();
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    expect(screen.getByRole('checkbox', { name: 'Laktózmentes' }).props.accessibilityState?.checked).toBe(true);
    expect(screen.getByRole('checkbox', { name: 'Van véglegminta engedélye' }).props.accessibilityState?.checked).toBe(false);
  });

  it('pressing a checkbox calls onFilterChange(field, !value)', async () => {
    const onFilterChange = jest.fn();
    await renderModal({ onFilterChange });
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Van véglegminta engedélye' }));
    expect(onFilterChange).toHaveBeenCalledWith('hasFinalSample', true);
  });

  it('apply, reset and close are buttons reachable by name', async () => {
    const onClose = jest.fn();
    const onReset = jest.fn();
    await renderModal({ onClose, onReset });
    await fireEvent.press(screen.getByRole('button', { name: 'Szűrők alkalmazása (1)' }));
    expect(onClose).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Törlés' }));
    expect(onReset).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Bezárás' })).toBeTruthy();
  });

  it('labels the text inputs with their visible labels', async () => {
    await renderModal();
    expect(screen.getByLabelText('ATC kód')).toBeTruthy();
    expect(screen.getByLabelText('Nyilvántartási szám')).toBeTruthy();
  });
});
