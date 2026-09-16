import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GuestLoginBanner from '../GuestLoginBanner';

describe('GuestLoginBanner', () => {
  it('megjeleníti az alapértelmezett magyar üzenetet és a gombok szövegét', async () => {
    await render(<GuestLoginBanner />);

    expect(
      screen.getByText('A funkció használatához bejelentkezés szükséges.')
    ).toBeTruthy();
    expect(screen.getByText('Bejelentkezés')).toBeTruthy();
    expect(screen.getByText('Regisztráció')).toBeTruthy();
  });
});
