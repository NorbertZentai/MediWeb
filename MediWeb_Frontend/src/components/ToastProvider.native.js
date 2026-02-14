import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

export function ToastProvider({ children }) {
  return (
    <>
      <View style={{ flex: 1, zIndex: 0 }}>
        {children}
      </View>
      <Toast />
    </>
  );
}
