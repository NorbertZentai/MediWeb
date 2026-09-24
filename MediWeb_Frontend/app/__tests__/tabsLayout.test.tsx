import React from 'react';
import { Platform } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

let mockCapturedScreenOptions: any;

jest.mock('expo-router', () => {
  const Tabs: any = (props: any) => {
    mockCapturedScreenOptions = props.screenOptions;
    return null;
  };
  Tabs.Screen = () => null;
  return { Tabs };
});

jest.mock('@/components/navigation', () => ({
  CustomTabBar: () => null,
}));

jest.mock('@/components/navigation/constants', () => ({
  TAB_BAR_COLORS: {
    light: { activeText: '#1', inactiveText: '#2', background: '#3', border: '#4', activePill: '#5' },
    dark: { activeText: '#1', inactiveText: '#2', background: '#3', border: '#4', activePill: '#5' },
  },
}));

jest.mock('@/components/HapticTab', () => ({
  HapticTab: () => null,
}));

jest.mock('@/src/components/Navbar', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));

import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import { AuthContext } from '@/src/contexts/AuthContext';
import TabLayout from '../(tabs)/_layout';

const originalPlatformOS = Platform.OS;
const hadDocument = 'document' in globalThis;
const originalDocument = (globalThis as any).document;

function mockWidth(width: number) {
  (useWindowDimensionsMock as unknown as jest.Mock).mockReturnValue({ width, height: 800 });
}

async function renderLayout() {
  await render(
    <AuthContext.Provider value={{ user: null } as any}>
      <TabLayout />
    </AuthContext.Provider>
  );
}

describe('TabLayout responsive tab bar', () => {
  beforeEach(() => {
    mockCapturedScreenOptions = undefined;
    (Platform as any).OS = 'web';
    (globalThis as any).document = { getElementById: () => null };
  });

  afterEach(() => {
    (Platform as any).OS = originalPlatformOS;
    if (hadDocument) {
      (globalThis as any).document = originalDocument;
    } else {
      delete (globalThis as any).document;
    }
    (useWindowDimensionsMock as unknown as jest.Mock).mockReset();
  });

  it('a mobil web nézeten (375) megjeleníti az alsó tab sávot', async () => {
    mockWidth(375);
    await renderLayout();

    expect(mockCapturedScreenOptions.tabBarStyle.height).toBe(70);
  });

  it('a desktop web nézeten (1280) elrejti az alsó tab sávot', async () => {
    mockWidth(1280);
    await renderLayout();

    expect(mockCapturedScreenOptions.tabBarStyle).toEqual({ display: 'none' });
  });

  it('natív platformon az egyedi tab sáv miatt az alapértelmezett sáv rejtett', async () => {
    (Platform as any).OS = 'ios';
    mockWidth(375);
    await renderLayout();

    expect(mockCapturedScreenOptions.tabBarStyle).toEqual({ display: 'none' });
  });
});
