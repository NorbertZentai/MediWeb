import Toast from 'react-native-toast-message';

/**
 * Native implementation of toast utility.
 * Uses react-native-toast-message.
 */
export const toast = {
    success: (message) => {
        Toast.show({
            type: 'success',
            text1: message,
            position: 'top',
            visibilityTime: 3000,
        });
    },
    error: (message) => {
        Toast.show({
            type: 'error',
            text1: message,
            position: 'top',
            visibilityTime: 4000,
        });
    },
    info: (message) => {
        Toast.show({
            type: 'info',
            text1: message,
            position: 'top',
            visibilityTime: 3000,
        });
    },
    warn: (message) => {
        // Native toast doesn't have built-in 'warn', mapping to info
        Toast.show({
            type: 'info',
            text1: message,
            position: 'top',
            visibilityTime: 3000,
        });
    },
};
