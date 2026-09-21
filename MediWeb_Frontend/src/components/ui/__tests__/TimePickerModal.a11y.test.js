import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import TimePickerModal from '../TimePickerModal';

// Issue #89: every hour/minute cell and the footer buttons of TimePickerModal
// must be reachable by role and by their visible Hungarian text, and must
// have an effective touch target of at least 44x44.
function measure(node) {
  const flat = StyleSheet.flatten(node.props.style) || {};
  const hitSlop = node.props.hitSlop || {};
  const width = (flat.minWidth || flat.width || 0) + (hitSlop.left || 0) + (hitSlop.right || 0);
  const height = (flat.minHeight || flat.height || 0) + (hitSlop.top || 0) + (hitSlop.bottom || 0);
  return { width, height };
}

async function renderTimePicker(props = {}) {
  return await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
      <TimePickerModal visible processedTime="08:30" onConfirm={jest.fn()} onCancel={jest.fn()} {...props} />
    </ThemeContext.Provider>
  );
}

describe('TimePickerModal accessibility (#89)', () => {
  it('exposes the confirm and cancel footer buttons by role and by their visible Hungarian text', async () => {
    await renderTimePicker();

    expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Kész' })).toBeTruthy();
  });

  it('gives the footer buttons an effective touch target of at least 44x44', async () => {
    await renderTimePicker();

    const cancel = measure(screen.getByRole('button', { name: 'Mégse' }));
    const confirm = measure(screen.getByRole('button', { name: 'Kész' }));

    expect(cancel.width).toBeGreaterThanOrEqual(44);
    expect(cancel.height).toBeGreaterThanOrEqual(44);
    expect(confirm.width).toBeGreaterThanOrEqual(44);
    expect(confirm.height).toBeGreaterThanOrEqual(44);
  });

  it('calls onConfirm with the selected "HH:mm" time after pressing a new hour and Kész', async () => {
    const onConfirm = jest.fn();
    await renderTimePicker({ onConfirm });

    await fireEvent.press(screen.getAllByRole('button', { name: '09' })[0]);
    await fireEvent.press(screen.getByRole('button', { name: 'Kész' }));

    expect(onConfirm).toHaveBeenCalledWith('09:30');
  });
});
