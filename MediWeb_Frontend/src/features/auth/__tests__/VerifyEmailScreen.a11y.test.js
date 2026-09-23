import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { VerifyEmailScreen } from '../VerifyEmailScreen';
import { verifyEmail } from '../auth.api';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ email: 'a@b.hu' }),
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock('../auth.api', () => ({ verifyEmail: jest.fn().mockResolvedValue({}) }));
jest.mock('utils/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const renderScreen = () =>
  render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <VerifyEmailScreen />
    </ThemeContext.Provider>
  );

describe('VerifyEmailScreen accessibility (#92)', () => {
  it('labels the code input with its visible label', async () => {
    await renderScreen();
    expect(screen.getByLabelText('Ellenőrző kód')).toBeTruthy();
  });

  it('exposes verify and back buttons by role and name; verify is disabled until 6 digits', async () => {
    await renderScreen();
    expect(screen.getByRole('button', { name: 'Vissza a bejelentkezéshez' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fiók aktiválása' }).props.accessibilityState?.disabled).toBe(true);
    await fireEvent.changeText(screen.getByLabelText('Ellenőrző kód'), '123456');
    expect(screen.getByRole('button', { name: 'Fiók aktiválása' }).props.accessibilityState?.disabled).toBe(false);
  });

  it('keeps the verify API call unchanged', async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText('Ellenőrző kód'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Fiók aktiválása' }));
    expect(verifyEmail).toHaveBeenCalledWith('a@b.hu', '123456');
  });
});
