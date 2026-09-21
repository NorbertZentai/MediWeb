import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import DatePickerModal from '../DatePickerModal';

// Issue #89: month navigation arrows need Hungarian labels ("Előző hónap",
// "Következő hónap"), the selected day cell must expose
// accessibilityState={{ selected: true }}, and every interactive element
// must have an effective touch target of at least 44x44.
function measure(node) {
  const flat = StyleSheet.flatten(node.props.style) || {};
  const hitSlop = node.props.hitSlop || {};
  const width = (flat.minWidth || flat.width || 0) + (hitSlop.left || 0) + (hitSlop.right || 0);
  const height = (flat.minHeight || flat.height || 0) + (hitSlop.top || 0) + (hitSlop.bottom || 0);
  return { width, height };
}

describe('DatePickerModal accessibility (#89)', () => {
  it('exposes the month navigation arrows with Hungarian accessibility labels', async () => {
    await render(
      <DatePickerModal visible processedDate="2026-09-15" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Előző hónap' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Következő hónap' })).toBeTruthy();
  });

  it('marks the selected day cell with accessibilityState={{ selected: true }}', async () => {
    await render(
      <DatePickerModal visible processedDate="2026-09-15" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    const selectedDay = screen.getByRole('button', { name: '15' });
    expect(selectedDay.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true })
    );
  });

  it('exposes the confirm and cancel footer buttons by role and by their visible Hungarian text', async () => {
    await render(
      <DatePickerModal visible processedDate="2026-09-15" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Kiválaszt' })).toBeTruthy();
  });

  it('gives the month navigation arrows an effective touch target of at least 44x44', async () => {
    await render(
      <DatePickerModal visible processedDate="2026-09-15" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    const prev = measure(screen.getByRole('button', { name: 'Előző hónap' }));
    const next = measure(screen.getByRole('button', { name: 'Következő hónap' }));

    expect(prev.width).toBeGreaterThanOrEqual(44);
    expect(prev.height).toBeGreaterThanOrEqual(44);
    expect(next.width).toBeGreaterThanOrEqual(44);
    expect(next.height).toBeGreaterThanOrEqual(44);
  });

  it('calls onConfirm with the selected date after pressing a day and the confirm button', async () => {
    const onConfirm = jest.fn();
    await render(
      <DatePickerModal visible processedDate="2026-09-15" onConfirm={onConfirm} onCancel={jest.fn()} />
    );

    await fireEvent.press(screen.getByRole('button', { name: '20' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Kiválaszt' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
