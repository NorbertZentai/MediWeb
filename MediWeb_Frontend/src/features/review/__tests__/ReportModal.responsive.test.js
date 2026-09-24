jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import ReportModal from '../ReportModal';

const originalOS = Platform.OS;

function setPlatform(os) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

async function renderStyles() {
  await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <ReportModal visible onClose={jest.fn()} onSubmit={jest.fn().mockResolvedValue()} reviewAuthor="Anna" />
    </ThemeContext.Provider>
  );
  return {
    keyboardView: StyleSheet.flatten(screen.getByTestId('report-modal-keyboard-view').props.style),
    modal: StyleSheet.flatten(screen.getByTestId('report-modal-container').props.style),
  };
}

describe('ReportModal width follows window width, not platform (issue #101)', () => {
  beforeEach(() => {
    useWindowDimensionsMock.mockReset();
  });

  afterEach(() => {
    setPlatform(originalOS);
  });

  it('caps keyboardView and modal at 480 at width 1280 on ios', async () => {
    setPlatform('ios');
    mockWidth(1280);
    const { keyboardView, modal } = await renderStyles();
    expect(keyboardView.maxWidth).toBe(480);
    expect(modal.maxWidth).toBe(480);
  });

  it('does not cap the width at 375 on web', async () => {
    setPlatform('web');
    mockWidth(375);
    const { keyboardView, modal } = await renderStyles();
    expect(keyboardView.maxWidth).toBeUndefined();
    expect(modal.maxWidth).toBeUndefined();
  });
});
