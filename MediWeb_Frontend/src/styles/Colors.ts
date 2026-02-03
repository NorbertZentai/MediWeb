/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Primary brand green
const primaryGreen = '#2E7D32';
const primaryGreenDark = '#6EE7B7';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Tab bar specific
    tabBarBackground: '#FFFFFF',
    tabBarActiveText: primaryGreen,
    tabBarInactiveText: '#9CA3AF',
    tabBarIndicator: primaryGreen,
    tabBarActivePill: '#ECFDF5',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Tab bar specific
    tabBarBackground: '#1F2937',
    tabBarActiveText: primaryGreenDark,
    tabBarInactiveText: '#6B7280',
    tabBarIndicator: primaryGreenDark,
    tabBarActivePill: 'rgba(110, 231, 183, 0.15)',
  },
};
