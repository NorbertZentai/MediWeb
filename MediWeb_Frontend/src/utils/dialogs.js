import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert helper.
 * On web, Alert.alert() silently fails, so we fall back to window.alert / window.confirm.
 * Shared by src/features/settings/SettingsScreen.js and
 * src/features/profile/components/SettingsTab.js (issue #77).
 */
export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const showConfirm = (title, message, { confirmText = 'OK', onConfirm, cancelText = 'Mégse', destructive = false } = {}) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm?.();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ]);
  }
};
