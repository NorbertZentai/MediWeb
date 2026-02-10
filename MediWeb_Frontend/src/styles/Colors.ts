/**
 * App color tokens derived from the centralized theme.
 * Used by navigation, tab bar, and platform-specific components.
 */

import { theme } from './theme';

export const Colors = {
  light: {
    text: theme.colors.textPrimary,
    background: theme.colors.white,
    tint: theme.colors.primary,
    icon: theme.colors.textSecondary,
    tabIconDefault: theme.colors.textSecondary,
    tabIconSelected: theme.colors.primary,
    // Tab bar specific
    tabBarBackground: theme.colors.white,
    tabBarActiveText: theme.colors.primary,
    tabBarInactiveText: theme.colors.textTertiary,
    tabBarIndicator: theme.colors.primary,
    tabBarActivePill: theme.colors.primaryMuted,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
    // Tab bar specific
    tabBarBackground: '#1F2937',
    tabBarActiveText: '#6EE7B7',
    tabBarInactiveText: '#6B7280',
    tabBarIndicator: '#6EE7B7',
    tabBarActivePill: 'rgba(110, 231, 183, 0.15)',
  },
};
