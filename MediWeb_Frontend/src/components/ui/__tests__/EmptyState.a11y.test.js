import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import EmptyState from '../EmptyState';

// Issue #89: the EmptyState action button must announce role="button" with
// the visible Hungarian label, and expose an effective touch target of at
// least 44x44 (minWidth/minHeight or hitSlop, same formula as
// BackButton.a11y.test.js).
describe('EmptyState accessibility (#89)', () => {
  it('exposes accessibilityRole="button" and the visible action label on the action button', async () => {
    await render(
      <EmptyState
        title="Nincs találat"
        subtitle="Próbálj meg más keresési feltételeket megadni."
        actionLabel="Új keresés"
        onAction={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Új keresés' })).toBeTruthy();
  });

  it('has an effective touch target of at least 44x44 on the action button', async () => {
    await render(
      <EmptyState
        title="Nincs találat"
        subtitle="Próbálj meg más keresési feltételeket megadni."
        actionLabel="Új keresés"
        onAction={jest.fn()}
      />
    );

    const button = screen.getByRole('button', { name: 'Új keresés' });
    const flat = StyleSheet.flatten(button.props.style) || {};
    const hitSlop = button.props.hitSlop || {};
    const width = (flat.minWidth || flat.width || 0) + (hitSlop.left || 0) + (hitSlop.right || 0);
    const height = (flat.minHeight || flat.height || 0) + (hitSlop.top || 0) + (hitSlop.bottom || 0);
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });
});
