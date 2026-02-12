import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Register for Push Notifications and get the token.
 * Safe to call on Web (returns null or handles gracefully).
 */
export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return null;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permission not granted for push notifications');
            return null;
        }

        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

        try {
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            return tokenData.data;
        } catch (e) {
            console.log('Error getting push token:', e);
            return null;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
        return null;
    }
}

/**
 * Get current push notification permission status.
 * @returns {Promise<string>} 'granted', 'denied', 'undetermined', or 'unsupported'
 */
export async function getPushPermissionStatus() {
    if (Platform.OS === 'web') return 'unsupported';
    if (!Device.isDevice) return 'unsupported';

    const { status } = await Notifications.getPermissionsAsync();
    return status;
}

/**
 * Schedule a local notification.
 * @param {string} title 
 * @param {string} body 
 * @param {object} data 
 * @param {number|null} seconds null for immediate
 */
export async function schedulePushNotification(title, body, data = {}, seconds = null) {
    const trigger = seconds ? { seconds } : null;
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger,
    });
}
