import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    type SharedValue,
} from 'react-native-reanimated';

import { INDICATOR_HEIGHT, INDICATOR_BORDER_RADIUS } from './constants';

export interface TabIndicatorProps {
    /** Shared value for indicator X position */
    indicatorX: SharedValue<number>;
    /** Width of each tab */
    tabWidth: number;
    /** Indicator color */
    color: string;
    /** Number of tabs (for width calculation) */
    tabCount: number;
}

export function TabIndicator({
    indicatorX,
    tabWidth,
    color,
    tabCount,
}: TabIndicatorProps) {
    // Calculate indicator width (slightly smaller than tab)
    const indicatorWidth = tabWidth > 0 ? tabWidth * 0.6 : 60;
    const indicatorOffset = tabWidth > 0 ? (tabWidth - indicatorWidth) / 2 : 0;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: indicatorX.value + indicatorOffset,
                },
            ],
            width: indicatorWidth,
        };
    });

    if (tabWidth <= 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.indicator,
                    { backgroundColor: color },
                    animatedStyle,
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: INDICATOR_HEIGHT,
    },
    indicator: {
        height: INDICATOR_HEIGHT,
        borderRadius: INDICATOR_BORDER_RADIUS,
    },
});

export default TabIndicator;
