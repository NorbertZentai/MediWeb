import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import { AuthContext } from 'contexts/AuthContext';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

// A truthy request keeps the Google button enabled, so the walker checks it.
jest.mock('expo-auth-session/providers/google', () => ({
  useIdTokenAuthRequest: () => [{}, null, jest.fn()],
}));

// Navbar has its own a11y test and pulls in layout hooks.
jest.mock('components/Navbar', () => () => null);

function renderRegister() {
  return render(
    <AuthContext.Provider value={{ user: null, register: jest.fn(), googleLogin: jest.fn() }}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
        <RegisterScreen />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

const GENDERS = ['Férfi', 'Nő', 'Egyéb'];

// Issue #111: RegisterScreen passes the runtime a11y walker and exposes the
// gender choice as a radiogroup with radio options.
describe('RegisterScreen accessibility (#111)', () => {
  it('passes the interactive-node a11y walker for a guest', async () => {
    await renderRegister();
    assertInteractiveNodesAreAccessible(screen.toJSON());
  });

  it('exposes the gender options as radios inside the "Nem" radiogroup', async () => {
    await renderRegister();
    expect(screen.getByRole('radiogroup', { name: 'Nem' })).toBeTruthy();
    GENDERS.forEach((name) => {
      expect(screen.getByRole('radio', { name })).toBeTruthy();
    });
  });

  it('checks only the pressed gender option', async () => {
    await renderRegister();
    await fireEvent.press(screen.getByRole('radio', { name: 'Nő' }));
    expect(screen.getByRole('radio', { name: 'Nő' }).props.accessibilityState.checked).toBe(true);
    ['Férfi', 'Egyéb'].forEach((name) => {
      expect(screen.getByRole('radio', { name }).props.accessibilityState.checked).toBe(false);
    });
  });

  it('labels every input and exposes the "Regisztráció" button', async () => {
    await renderRegister();
    ['Név', 'Email cím', 'Jelszó', 'Jelszó megerősítése', 'Születési dátum'].forEach((label) => {
      expect(screen.getByLabelText(label)).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: 'Regisztráció' })).toBeTruthy();
  });
});
