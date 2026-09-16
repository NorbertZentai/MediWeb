import React from 'react';
import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { ThemeProvider } from '@/src/contexts/ThemeContext';
import NotFoundScreen from '../+not-found';

describe('NotFoundScreen', () => {
  it('megjeleníti a magyar hibaüzenetet és a főoldalra visszavezető linket', async () => {
    await render(
      <ThemeProvider>
        <NotFoundScreen />
      </ThemeProvider>
    );

    expect(screen.getByText('Ez az oldal nem található.')).toBeTruthy();
    expect(screen.getByText('Vissza a főoldalra')).toBeTruthy();
  });

  it('a link megnyomása a főoldalra navigál', async () => {
    await render(
      <ThemeProvider>
        <NotFoundScreen />
      </ThemeProvider>
    );

    const router = useRouter();
    fireEvent.press(screen.getByText('Vissza a főoldalra'));

    expect(router.push).toHaveBeenCalledWith('/');
  });
});
