jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import CustomDropdown from '../CustomDropdown';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';

function mockHeight(height) {
  useWindowDimensionsMock.mockReturnValue({ width: 400, height });
}

const OPTIONS = [
  { label: 'Első', value: 1 },
  { label: 'Második', value: 2 },
];

async function renderDropdown() {
  return await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, themeMode: 'system', setThemeMode: jest.fn() }}>
      <CustomDropdown options={OPTIONS} selectedValue={null} onValueChange={jest.fn()} placeholder="Válassz..." />
    </ThemeContext.Provider>
  );
}

async function openDropdownAndGetCardStyle() {
  await fireEvent.press(screen.getByText('Válassz...'));
  await waitFor(() => expect(screen.getByText('Első')).toBeTruthy());

  // The Animated.View wrapping the FlatList options is the dropdown card —
  // find it via its child text and walk up to the flattened style prop.
  const optionText = screen.getByText('Első');
  let node = optionText;
  while (node && !(node.props && node.props.style && StyleSheet.flatten(node.props.style)?.maxHeight !== undefined)) {
    node = node.parent;
  }
  return StyleSheet.flatten(node.props.style);
}

describe('CustomDropdown maxHeight (issue #88)', () => {
  it('computes maxHeight as 400 from a window height of 800', async () => {
    mockHeight(800);
    await renderDropdown();

    const style = await openDropdownAndGetCardStyle();

    expect(style.maxHeight).toBe(400);
  });

  it('computes maxHeight as 500 from a window height of 1000', async () => {
    mockHeight(1000);
    await renderDropdown();

    const style = await openDropdownAndGetCardStyle();

    expect(style.maxHeight).toBe(500);
  });
});
