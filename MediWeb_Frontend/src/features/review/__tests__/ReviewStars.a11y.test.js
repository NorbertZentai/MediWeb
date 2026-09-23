import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { lightTheme } from 'styles/theme';
import ReviewStars from '../ReviewStars';

const renderStars = (props) => render(<ReviewStars theme={lightTheme} styles={{}} {...props} />);

describe('ReviewStars accessibility (#92)', () => {
  it('interactive: each star is a button labelled "<n> csillag" and pressing 4 calls onChange(4)', async () => {
    const onChange = jest.fn();
    await renderStars({ value: 2, onChange, interactive: true });
    for (let n = 1; n <= 5; n++) {
      expect(screen.getByRole('button', { name: n + ' csillag' })).toBeTruthy();
    }
    await fireEvent.press(screen.getByRole('button', { name: '4 csillag' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('interactive: accessibilityState.selected is true for stars up to the rating only', async () => {
    await renderStars({ value: 3, onChange: jest.fn(), interactive: true });
    [1, 2, 3].forEach((n) =>
      expect(screen.getByRole('button', { name: n + ' csillag' }).props.accessibilityState?.selected).toBe(true));
    [4, 5].forEach((n) =>
      expect(screen.getByRole('button', { name: n + ' csillag' }).props.accessibilityState?.selected).toBe(false));
  });

  it('interactive: stars have an effective touch target of at least 44x44', async () => {
    await renderStars({ value: 1, onChange: jest.fn(), interactive: true });
    const star = screen.getByRole('button', { name: '1 csillag' });
    const s = StyleSheet.flatten(star.props.style) || {};
    const h = star.props.hitSlop || {};
    const w = Math.max(s.minWidth || 0, s.width || 0) + (h.left || 0) + (h.right || 0);
    const ht = Math.max(s.minHeight || 0, s.height || 0) + (h.top || 0) + (h.bottom || 0);
    expect(w).toBeGreaterThanOrEqual(44);
    expect(ht).toBeGreaterThanOrEqual(44);
  });

  it('read-only: renders a single image element whose label contains the rating and no buttons', async () => {
    await renderStars({ value: 4, interactive: false });
    const img = screen.getByRole('image');
    expect(String(img.props.accessibilityLabel)).toContain('4');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
