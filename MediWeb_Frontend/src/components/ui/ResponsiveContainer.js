import React from 'react';
import { View } from 'react-native';
import {
  useResponsiveLayout,
  CONTAINER_MAX_WIDTHS,
} from '../../hooks/useResponsiveLayout';

/**
 * Shared layout primitive that decides page content width in a single,
 * testable place. Width is derived purely from useResponsiveLayout()
 * (i.e. from useWindowDimensions), never from Platform.OS, so web and
 * native render identically at the same window width.
 */
export default function ResponsiveContainer({
  children,
  maxWidth = 'content',
  padded = true,
  center = true,
  style,
  testID,
}) {
  const { isMobile } = useResponsiveLayout();

  const resolvedMaxWidth =
    typeof maxWidth === 'number' ? maxWidth : CONTAINER_MAX_WIDTHS[maxWidth];

  const computedStyle = { width: '100%' };

  if (!isMobile) {
    computedStyle.maxWidth = resolvedMaxWidth;
  }

  if (padded) {
    computedStyle.paddingHorizontal = isMobile ? 16 : 32;
  }

  if (center && !isMobile) {
    computedStyle.alignSelf = 'center';
  }

  return (
    <View testID={testID} style={[computedStyle, style]}>
      {children}
    </View>
  );
}
