import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Platform, Vibration } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    useReducedMotion,
    type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FontAwesome5 } from '@expo/vector-icons';

import {
    TOUCH_TARGET_SIZE,
    ICON_SIZE,
    ANIMATION_CONFIG,
    TAB_BAR_COLORS,
} from './constants';

export interface AnimatedTabItemProps {
    /** Tab label text */
    label: string;
    /** Icon name for FontAwesome5 */
    iconName: string;
    /** Whether this tab is currently active */
    isFocused: boolean;
    /** Callback when tab is pressed */
    onPress: () => void;
    /** Callback when tab receives long press */
    onLongPress?: () => void;
    /** Current color scheme */
    colorScheme: 'light' | 'dark' | null | undefined;
    /** Tab index (for indicator positioning) */
    index: number;
    /** Shared value for indicator X position */
    indicatorX: SharedValue<number>;
    /** Tab width for indicator calculation */
    tabWidth: number;
    /** Accessibility label override */
    accessibilityLabel?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedTabItem({
    label,
    iconName,
    isFocused,
    onPress,
    onLongPress,
    colorScheme,
    index,
    indicatorX,
    tabWidth,
    accessibilityLabel,
}: AnimatedTabItemProps) {
    const reducedMotion = useReducedMotion();
    const colors = TAB_BAR_COLORS[colorScheme ?? 'light'];

    // Animated values
    const scale = useSharedValue(1);
    const labelOpacity = useSharedValue(isFocused ? 1 : 0.6);

    // Update indicator position when focus changes
    useEffect(() => {
        if (isFocused && tabWidth > 0) {
            const targetX = index * tabWidth;
            indicatorX.value = reducedMotion
                ? targetX
                : withSpring(targetX, ANIMATION_CONFIG.spring);
        }

        // Animate label opacity
        labelOpacity.value = withTiming(
            isFocused ? 1 : 0.6,
            ANIMATION_CONFIG.labelFade
        );
    }, [isFocused, index, tabWidth, reducedMotion]);

    // Haptic feedback helper
    const triggerHaptic = useCallback(() => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (Platform.OS === 'android') {
            Vibration.vibrate(10);
        }
    }, []);

    // Press handlers
    const handlePressIn = useCallback(() => {
        'worklet';
        scale.value = withSpring(0.92, ANIMATION_CONFIG.pressScale);
        runOnJS(triggerHaptic)();
    }, [triggerHaptic]);

    const handlePressOut = useCallback(() => {
        'worklet';
        scale.value = withSpring(1, ANIMATION_CONFIG.pressScale);
    }, []);

    // Animated styles
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const labelAnimatedStyle = useAnimatedStyle(() => ({
        opacity: labelOpacity.value,
    }));

    const iconColor = isFocused ? colors.activeText : colors.inactiveText;
    const labelColor = isFocused ? colors.activeText : colors.inactiveText;

    return (
        <AnimatedPressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={accessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, containerAnimatedStyle]}
        >
            {/* Active background pill */}
            {isFocused && (
                <View style={[styles.activePill, { backgroundColor: colors.activePill }]} />
            )}

            {/* Icon */}
            <FontAwesome5
                name={iconName}
                size={ICON_SIZE}
                color={iconColor}
                solid={isFocused}
            />

            {/* Label */}
            <Animated.Text
                style={[styles.label, { color: labelColor }, labelAnimatedStyle]}
                numberOfLines={1}
            >
                {label}
            </Animated.Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: TOUCH_TARGET_SIZE,
        minHeight: TOUCH_TARGET_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
    },
    activePill: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        marginHorizontal: 8,
        marginVertical: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default AnimatedTabItem;
