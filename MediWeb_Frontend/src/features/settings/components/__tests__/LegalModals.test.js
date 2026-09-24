jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import React from 'react';
import fs from 'fs';
import path from 'path';
import { Platform, StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import TermsModal from '../TermsModal';
import PrivacyPolicyModal from '../PrivacyPolicyModal';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme, darkTheme } from 'styles/theme';

const originalOS = Platform.OS;

function setPlatform(os) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

const CASES = [
  { name: 'TermsModal', prefix: 'terms', Component: TermsModal, file: 'TermsModal.js' },
  { name: 'PrivacyPolicyModal', prefix: 'privacy', Component: PrivacyPolicyModal, file: 'PrivacyPolicyModal.js' },
];

async function renderStyles(Component, prefix, theme = lightTheme, isDark = false) {
  await render(
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: jest.fn() }}>
      <Component visible onClose={jest.fn()} />
    </ThemeContext.Provider>
  );
  return {
    container: StyleSheet.flatten(screen.getByTestId(`${prefix}-modal-container`).props.style),
    overlay: StyleSheet.flatten(screen.getByTestId(`${prefix}-modal-overlay`).props.style),
  };
}

describe('legal modals follow window width and theme (issue #101)', () => {
  beforeEach(() => {
    useWindowDimensionsMock.mockReset();
  });

  afterEach(() => {
    setPlatform(originalOS);
  });

  CASES.forEach(({ name, prefix, Component }) => {
    describe(name, () => {
      it('caps the dialog at 600 at width 1280 on ios', async () => {
        setPlatform('ios');
        mockWidth(1280);
        const { container, overlay } = await renderStyles(Component, prefix);
        expect(container.maxWidth).toBe(600);
        expect(overlay.backgroundColor).toBe(lightTheme.components.modal.overlay);
      });

      it('does not cap the width at 375 on web', async () => {
        setPlatform('web');
        mockWidth(375);
        const { container } = await renderStyles(Component, prefix);
        expect(container.maxWidth).toBeUndefined();
      });

      it('uses the dark theme card background and overlay', async () => {
        setPlatform('ios');
        mockWidth(1280);
        const { container, overlay } = await renderStyles(Component, prefix, darkTheme, true);
        expect(container.backgroundColor).toBe(darkTheme.colors.backgroundCard);
        expect(overlay.backgroundColor).toBe(darkTheme.components.modal.overlay);
      });
    });
  });

  describe('source files', () => {
    ['TermsModal.js', 'PrivacyPolicyModal.js', 'LegalModal.style.js'].forEach((file) => {
      it(`${file} has no platform check or color literal`, () => {
        const src = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        expect(src).not.toMatch(/Platform/);
        expect(src).not.toMatch(/#fff/i);
        expect(src).not.toMatch(/rgba\(/);
      });
    });
  });
});
