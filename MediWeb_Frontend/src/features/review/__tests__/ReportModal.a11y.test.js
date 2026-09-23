import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import ReportModal from '../ReportModal';

const renderModal = (props = {}) =>
  render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <ReportModal visible onClose={jest.fn()} onSubmit={jest.fn().mockResolvedValue()} reviewAuthor="Anna" {...props} />
    </ThemeContext.Provider>
  );

describe('ReportModal accessibility (#92)', () => {
  it('exposes the five reasons as radios with checked=false initially', async () => {
    await renderModal();
    ['Spam vagy hirdetés', 'Nem megfelelő tartalom', 'Félrevezető információ', 'Sértő / bántó nyelvezet', 'Egyéb'].forEach((l) => {
      expect(screen.getByRole('radio', { name: l }).props.accessibilityState?.checked).toBe(false);
    });
  });

  it('pressing a reason flips only that radio to checked and enables submit', async () => {
    const onSubmit = jest.fn().mockResolvedValue();
    await renderModal({ onSubmit });
    expect(screen.getByRole('button', { name: 'Bejelentés' }).props.accessibilityState?.disabled).toBe(true);
    await fireEvent.press(screen.getByRole('radio', { name: 'Egyéb' }));
    expect(screen.getByRole('radio', { name: 'Egyéb' }).props.accessibilityState?.checked).toBe(true);
    expect(screen.getByRole('radio', { name: 'Spam vagy hirdetés' }).props.accessibilityState?.checked).toBe(false);
    expect(screen.getByRole('button', { name: 'Bejelentés' }).props.accessibilityState?.disabled).toBe(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Bejelentés' }));
    expect(onSubmit).toHaveBeenCalledWith('OTHER', null);
  });

  it('has cancel and close buttons and a labelled comment input', async () => {
    await renderModal();
    expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bezárás' })).toBeTruthy();
    expect(screen.getByLabelText('Megjegyzés (opcionális)')).toBeTruthy();
  });
});
