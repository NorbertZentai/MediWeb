import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ProfileHeader from '../ProfileHeader';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

jest.mock('utils/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock('features/profile/profile.api', () => ({
  updateUsername: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  updatePhoneNumber: jest.fn(),
  updateProfileImage: jest.fn(),
  fetchCurrentUser: jest.fn(),
}));

const { fetchCurrentUser } = require('features/profile/profile.api');

async function renderHeader() {
  await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <ProfileHeader />
    </ThemeContext.Provider>
  );
  // The phone number is rendered once, so it is a safe "user loaded" anchor
  // (name and email appear in both the header and their info cards).
  await screen.findByText('+36301234567');
}

const buttonNames = () =>
  screen.getAllByRole('button').map((el) => el.props.accessibilityLabel);

describe('ProfileHeader accessibility (#112)', () => {
  beforeEach(() => {
    fetchCurrentUser.mockResolvedValue({
      name: 'Kiss Anna',
      email: 'anna@example.com',
      phone_number: '+36301234567',
      imageUrl: null,
    });
  });

  it('closed state exposes accessible header buttons', async () => {
    await renderHeader();
    assertInteractiveNodesAreAccessible(screen.toJSON());
    expect(screen.getByRole('button', { name: 'Profilkép szerkesztése' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Név szerkesztése' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Jelszó szerkesztése' })).toBeTruthy();
  });

  it('password edit modal labels its inputs and buttons', async () => {
    await renderHeader();
    const before = buttonNames();
    await fireEvent.press(screen.getByRole('button', { name: 'Jelszó szerkesztése' }));

    expect(screen.getByLabelText('Jelenlegi jelszó')).toBeTruthy();
    expect(screen.getByLabelText('Új jelszó')).toBeTruthy();
    expect(screen.getByLabelText('Új jelszó megerősítése')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mégse' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mentés' })).toBeTruthy();

    assertInteractiveNodesAreAccessible(screen.toJSON());
    // The inner stopPropagation Pressable stays accessible={false}: the modal adds
    // exactly the overlay, Mégse and Mentés buttons, nothing else.
    expect(buttonNames().filter((n) => !before.includes(n)).sort()).toEqual(
      ['Bezárás', 'Mégse', 'Mentés'].sort()
    );
  });

  it('name edit modal exposes the labelled name input', async () => {
    await renderHeader();
    await fireEvent.press(screen.getByRole('button', { name: 'Név szerkesztése' }));
    const input = screen.getByLabelText('Neved');
    expect(input.props.value).toBe('Kiss Anna');
    assertInteractiveNodesAreAccessible(screen.toJSON());
  });

  it('image edit modal exposes an accessible upload button', async () => {
    await renderHeader();
    await fireEvent.press(screen.getByRole('button', { name: 'Profilkép szerkesztése' }));
    expect(screen.getByRole('button', { name: 'Kép feltöltése' })).toBeTruthy();
    assertInteractiveNodesAreAccessible(screen.toJSON());
  });
});
