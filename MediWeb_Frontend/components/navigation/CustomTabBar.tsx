import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { AnimatedTabItem } from './AnimatedTabItem';
import { TabIndicator } from './TabIndicator';
import {
    TAB_BAR_HEIGHT,
    TAB_BAR_BORDER_RADIUS,
    TAB_BAR_SHADOW,
    TAB_BAR_COLORS,
} from './constants';
import { useTheme } from '@/src/contexts/ThemeContext';

// Icon mapping for tabs
const TAB_ICONS: Record<string, string> = {
    index: 'home',
    search: 'search',
    favorites: 'heart',
    profile: 'user',
    settings: 'cog',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const colorScheme = isDark ? 'dark' : 'light';
    const colors = TAB_BAR_COLORS[colorScheme];

    // Track tab container width for indicator positioning
    const [containerWidth, setContainerWidth] = useState(0);
    const tabWidth = state.routes.length > 0 ? containerWidth / state.routes.length : 0;

    // Shared value for animated indicator
    const indicatorX = useSharedValue(state.index * tabWidth);

    // Handle container layout
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    }, []);

    // Handle tab press
    const handleTabPress = useCallback(
        (routeKey: string, routeName: string, isFocused: boolean) => {
            const event = navigation.emit({
                type: 'tabPress',
                target: routeKey,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(routeName);
            }
        },
        [navigation]
    );

    // Handle tab long press
    const handleTabLongPress = useCallback(
        (routeKey: string) => {
            navigation.emit({
                type: 'tabLongPress',
                target: routeKey,
            });
        },
        [navigation]
    );

    const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0);

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: bottomPadding, borderTopWidth: 0, elevation: 0 },
            ]}
        >
            {/* Background - Blur on iOS, solid on Android */}
            {Platform.OS === 'ios' ? (
                <BlurView
                    intensity={80}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
            ) : (
                <View
                    style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
                />
            )}

            {/* Tab content container */}
            <View style={styles.tabsWrapper} onLayout={handleLayout}>
                {/* Sliding indicator */}
                <TabIndicator
                    indicatorX={indicatorX}
                    tabWidth={tabWidth}
                    color={colors.indicator}
                    tabCount={state.routes.length}
                />

                {/* Tab items */}
                <View style={styles.tabsContainer}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const label =
                            options.tabBarLabel !== undefined
                                ? String(options.tabBarLabel)
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const iconName = TAB_ICONS[route.name] || 'circle';

                        return (
                            <AnimatedTabItem
                                key={route.key}
                                label={label}
                                iconName={iconName}
                                isFocused={isFocused}
                                onPress={() => handleTabPress(route.key, route.name, isFocused)}
                                onLongPress={() => handleTabLongPress(route.key)}
                                colorScheme={colorScheme}
                                index={index}
                                indicatorX={indicatorX}
                                tabWidth={tabWidth}
                            />
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: TAB_BAR_BORDER_RADIUS,
        borderTopRightRadius: TAB_BAR_BORDER_RADIUS,
        overflow: 'hidden',
    },
    tabsWrapper: {
        height: TAB_BAR_HEIGHT,
        position: 'relative',
    },
    tabsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});

export default CustomTabBar;
