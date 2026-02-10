import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ToastProvider } from '@/src/components/ToastProvider';

import { registerForPushNotificationsAsync } from '@/src/utils/notifications';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// ...

import { useRouter, useSegments } from 'expo-router';
import { AuthContext } from '@/src/contexts/AuthContext';
import { useContext } from 'react';

// Handle protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    // If user is not logged in and trying to access protected routes
    if (!user && inAuthGroup) {
      // Redirect to login
      router.replace('/login');
    } else if (user && (segments[0] === 'login' || segments[0] === 'register')) {
      // If user is logged in and tries to access login/register, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return children;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Hide splash screen immediately since we're not loading custom fonts
  useEffect(() => {
    SplashScreen.hideAsync();

    // Initialize notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push Token:', token);
        // Here you would typically send the token to your backend
      }
    }).catch(err => console.log('Notification setup error:', err));
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ProtectedRoute>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="medication/[id]" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ProtectedRoute>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

