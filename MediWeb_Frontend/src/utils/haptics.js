import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Wrapper for Expo Haptics to ensure safety on Web and consistent usage.
 */
export const haptics = {
    /**
     * Light impact, good for buttons and small interactions.
     */
    light: async () => {
        if (isWeb) return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
            // Ignore haptics errors
        }
    },

    /**
     * Medium impact, good for significant actions like form submission or toggles.
     */
    medium: async () => {
        if (isWeb) return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
            // Ignore
        }
    },

    /**
     * Heavy impact.
     */
    heavy: async () => {
        if (isWeb) return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {
            // Ignore
        }
    },

    /**
     * Success notification pattern.
     */
    success: async () => {
        if (isWeb) return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            // Ignore
        }
    },

    /**
     * Error notification pattern.
     */
    error: async () => {
        if (isWeb) return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (e) {
            // Ignore
        }
    },

    /**
   * Warning notification pattern.
   */
    warning: async () => {
        if (isWeb) return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (e) {
            // Ignore
        }
    },
};
