/**
 * Navigation Tab Bar Constants
 * Centralized configuration for the custom bottom tab bar
 */

import { Platform } from 'react-native';
import { Colors } from '@/src/styles/Colors';

// ============================================
// DIMENSIONS
// ============================================

/** Tab bar height (excluding safe area) */
export const TAB_BAR_HEIGHT = Platform.select({
  ios: 49,
  android: 56,
  default: 56,
});

/** Minimum touch target size (accessibility requirement) */
export const TOUCH_TARGET_SIZE = 48;

/** Icon size in the tab bar */
export const ICON_SIZE = 24;

/** Tab indicator height */
export const INDICATOR_HEIGHT = 3;

/** Tab indicator border radius */
export const INDICATOR_BORDER_RADIUS = 1.5;

/** Tab bar border radius (top corners) */
export const TAB_BAR_BORDER_RADIUS = 24;

// ============================================
// ANIMATION CONFIGURATION
// ============================================

export const ANIMATION_CONFIG = {
  /** Spring animation for indicator movement */
  spring: {
    damping: 18,
    stiffness: 200,
    mass: 1,
  },
  /** Timing for label opacity changes */
  labelFade: {
    duration: 200,
  },
  /** Scale animation on press */
  pressScale: {
    damping: 15,
    stiffness: 300,
  },
} as const;

// ============================================
// COLOR TOKENS
// ============================================

export const TAB_BAR_COLORS = {
  light: {
    background: Colors.light.tabBarBackground,
    activeText: Colors.light.tabBarActiveText,
    inactiveText: Colors.light.tabBarInactiveText,
    indicator: Colors.light.tabBarIndicator,
    activePill: Colors.light.tabBarActivePill,
    shadow: 'rgba(0, 0, 0, 0.08)',
    border: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    background: Colors.dark.tabBarBackground,
    activeText: Colors.dark.tabBarActiveText,
    inactiveText: Colors.dark.tabBarInactiveText,
    indicator: Colors.dark.tabBarIndicator,
    activePill: Colors.dark.tabBarActivePill,
    shadow: 'rgba(0, 0, 0, 0.3)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

// ============================================
// TAB CONFIGURATION
// ============================================

export interface TabConfig {
  name: string;
  title: string;
  icon: string;
  iconOutline?: string;
}

/** Default tab configurations (can be overridden) */
export const DEFAULT_TABS: TabConfig[] = [
  { name: 'index', title: 'Főoldal', icon: 'home' },
  { name: 'search', title: 'Keresés', icon: 'search' },
  { name: 'favorites', title: 'Kedvenc', icon: 'heart' },
  { name: 'profile', title: 'Profil', icon: 'user' },
  { name: 'settings', title: 'Beállít.', icon: 'cog' },
];

// ============================================
// STYLE HELPERS
// ============================================

/** Shadow style for tab bar elevation */
export const TAB_BAR_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: {
    elevation: 12,
  },
  default: {},
});

/** Get color tokens based on color scheme */
export function getTabBarColors(colorScheme: 'light' | 'dark' | null | undefined) {
  return TAB_BAR_COLORS[colorScheme ?? 'light'];
}
