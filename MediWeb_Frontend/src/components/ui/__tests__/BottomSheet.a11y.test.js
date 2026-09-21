import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import BottomSheet from '../BottomSheet';

// Issue #89: the BottomSheet backdrop is the only icon-only "close" gesture
// in this component, so it must be reachable by role="button" with the
// Hungarian "Bezárás" label, and still call onClose when pressed.
describe('BottomSheet accessibility (#89)', () => {
  it('exposes the backdrop as accessibilityRole="button" with the "Bezárás" label', async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Tartalom</Text>
      </BottomSheet>
    );

    expect(screen.getByRole('button', { name: 'Bezárás' })).toBeTruthy();
  });

  it('calls onClose when the backdrop is pressed', async () => {
    const onClose = jest.fn();
    await render(
      <BottomSheet visible onClose={onClose}>
        <Text>Tartalom</Text>
      </BottomSheet>
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Bezárás' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
