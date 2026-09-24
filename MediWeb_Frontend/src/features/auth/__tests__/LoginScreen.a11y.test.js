import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

// Simulates the Google auth request not being ready yet, i.e. the visible
// "disabled" state the acceptance criteria describe.
jest.mock('expo-auth-session/providers/google', () => ({
  useIdTokenAuthRequest: () => [null, null, jest.fn()],
}));

function renderLogin(login = jest.fn()) {
  return render(
    <AuthContext.Provider value={{ user: null, login, googleLogin: jest.fn() }}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
        <LoginScreen />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// Issue #78: the primary text inputs need an accessibilityLabel matching
// their Hungarian placeholder, and disabled buttons must expose
// accessibilityState={{ disabled: true }}.
describe('LoginScreen accessibility (#78)', () => {
  it('labels the email and password inputs with their Hungarian placeholder text', async () => {
    await renderLogin();
    expect(screen.getByLabelText('Email cím')).toBeTruthy();
    expect(screen.getByLabelText('Jelszó')).toBeTruthy();
  });

  it('exposes the submit button with accessibilityRole="button" and the "Bejelentkezés" label', async () => {
    await renderLogin();
    expect(screen.getByRole('button', { name: 'Bejelentkezés' })).toBeTruthy();
  });

  it('marks the disabled Google login button with accessibilityState={ disabled: true }', async () => {
    await renderLogin();
    const googleButton = screen.getByRole('button', { name: /Google/ });
    expect(googleButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('labels the 2FA code input "Hitelesítő kód" once 2FA is required', async () => {
    const login = jest.fn().mockResolvedValue({ requires2fa: true });
    await renderLogin(login);
    await fireEvent.changeText(screen.getByLabelText('Email cím'), 'a@b.hu');
    await fireEvent.changeText(screen.getByLabelText('Jelszó'), 'titok123');
    await fireEvent.press(screen.getByRole('button', { name: 'Bejelentkezés' }));
    expect(await screen.findByLabelText('Hitelesítő kód')).toBeTruthy();
  });
});
