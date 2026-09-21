import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import ConfirmModal from '../ConfirmModal';

// Issue #89: ConfirmModal must expose its confirm and cancel buttons by
// role and by name (the Hungarian texts passed in as props), and both
// must have an effective touch target of at least 44x44.
function measure(node) {
  const flat = StyleSheet.flatten(node.props.style) || {};
  const hitSlop = node.props.hitSlop || {};
  const width = (flat.minWidth || flat.width || 0) + (hitSlop.left || 0) + (hitSlop.right || 0);
  const height = (flat.minHeight || flat.height || 0) + (hitSlop.top || 0) + (hitSlop.bottom || 0);
  return { width, height };
}

describe('ConfirmModal accessibility (#89)', () => {
  it('exposes the cancel button by role and by the default "Mégse" name', async () => {
    await render(
      <ConfirmModal visible title="Biztosan törlöd?" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
  });

  it('exposes the confirm button by role and by the confirmLabel prop text', async () => {
    await render(
      <ConfirmModal
        visible
        title="Biztosan törlöd?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        confirmLabel="Kijelentkezés"
      />
    );

    expect(screen.getByRole('button', { name: 'Kijelentkezés' })).toBeTruthy();
  });

  it('gives both cancel and confirm buttons an effective touch target of at least 44x44', async () => {
    await render(
      <ConfirmModal visible title="Biztosan törlöd?" onConfirm={jest.fn()} onCancel={jest.fn()} />
    );

    const cancel = measure(screen.getByRole('button', { name: 'Mégse' }));
    const confirm = measure(screen.getByRole('button', { name: 'Törlés' }));

    expect(cancel.width).toBeGreaterThanOrEqual(44);
    expect(cancel.height).toBeGreaterThanOrEqual(44);
    expect(confirm.width).toBeGreaterThanOrEqual(44);
    expect(confirm.height).toBeGreaterThanOrEqual(44);
  });
});
