import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { ToastContainer } from 'react-toastify';
import Toast from 'react-native-toast-message';
import 'react-toastify/dist/ReactToastify.css';

const isWeb = Platform.OS === 'web';

export function ToastProvider({ children }) {
  return (
    <>
      <View style={{ flex: 1, zIndex: 0 }}>
        {children}
      </View>

      {isWeb ? (
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      ) : (
        <Toast />
      )}
    </>
  );
}