import { Platform } from 'react-native';
import { toast as webToast } from 'react-toastify';
import Toast from 'react-native-toast-message';

const isWeb = Platform.OS === 'web';

/**
 * Platform-agnostic toast utility.
 * Uses react-toastify on Web and react-native-toast-message on Native.
 */
export const toast = {
    success: (message) => {
        if (isWeb) {
            webToast.success(message);
        } else {
            Toast.show({
                type: 'success',
                text1: message,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    },
    error: (message) => {
        if (isWeb) {
            webToast.error(message);
        } else {
            Toast.show({
                type: 'error',
                text1: message,
                position: 'top',
                visibilityTime: 4000,
            });
        }
    },
    info: (message) => {
        if (isWeb) {
            webToast.info(message);
        } else {
            Toast.show({
                type: 'info',
                text1: message,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    },
    warn: (message) => {
        if (isWeb) {
            webToast.warn(message);
        } else {
            // Native toast doesn't have built-in 'warn', mapping to info or creating custom type could be done.
            // For now, mapping to info with a distinct look if configured, or just standard info.
            Toast.show({
                type: 'info',
                text1: message,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    },
};
