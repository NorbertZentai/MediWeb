import React from 'react';
import { View } from 'react-native';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ToastProvider({ children }) {
  return (
    <>
      <View style={{ flex: 1, zIndex: 0 }}>
        {children}
      </View>
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
    </>
  );
}
