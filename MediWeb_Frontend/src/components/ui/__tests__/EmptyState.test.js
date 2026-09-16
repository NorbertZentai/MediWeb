import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('megjeleníti a title-t, subtitle-t és az akciógomb szövegét', async () => {
    await render(
      <EmptyState
        title="Nincs találat"
        subtitle="Próbálj meg más keresési feltételeket megadni."
        actionLabel="Új keresés"
        onAction={jest.fn()}
      />
    );

    expect(screen.getByText('Nincs találat')).toBeTruthy();
    expect(screen.getByText('Próbálj meg más keresési feltételeket megadni.')).toBeTruthy();
    expect(screen.getByText('Új keresés')).toBeTruthy();
  });

  it('meghívja az onAction-t az akciógombra kattintáskor', async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState
        title="Nincs találat"
        subtitle="Próbálj meg más keresési feltételeket megadni."
        actionLabel="Új keresés"
        onAction={onAction}
      />
    );

    await fireEvent.press(screen.getByText('Új keresés'));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
