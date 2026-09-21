import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import BackButton from '../BackButton';

// Issue #78: the back button must announce role="button" with the Hungarian
// "Vissza" label, and expose an effective touch target of at least 44x44.
describe('BackButton accessibility (#78)', () => {
  it('exposes accessibilityRole="button" and the "Vissza" label', async () => {
    await render(<BackButton />);
    expect(screen.getByRole('button', { name: 'Vissza' })).toBeTruthy();
  });

  it('has an effective touch target of at least 44x44', async () => {
    await render(<BackButton />);
    const button = screen.getByRole('button', { name: 'Vissza' });
    const flat = StyleSheet.flatten(button.props.style) || {};
    const hitSlop = button.props.hitSlop || {};
    const width = (flat.minWidth || flat.width || 0) + (hitSlop.left || 0) + (hitSlop.right || 0);
    const height = (flat.minHeight || flat.height || 0) + (hitSlop.top || 0) + (hitSlop.bottom || 0);
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });
});
