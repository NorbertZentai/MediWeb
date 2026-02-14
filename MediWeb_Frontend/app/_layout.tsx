import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/src/contexts/ThemeContext';
import { ToastProvider } from '@/src/components/ToastProvider';

import { registerForPushNotificationsAsync } from '@/src/utils/notifications';
import { registerPushToken } from '@/src/features/profile/profile.api';
import storage from '@/src/utils/storage';
import { Logger } from '@/src/utils/Logger';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { useRouter, useSegments } from 'expo-router';
import { AuthContext } from '@/src/contexts/AuthContext';
import { useContext } from 'react';

// ErrorBoundary to catch render crashes and display useful error info
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const componentStack = errorInfo.componentStack || '';
    console.error('[APP] ErrorBoundary caught:', error.message);
    console.error('[APP] Stack:', error.stack);
    console.error('[APP] Component stack:', componentStack);
    this.setState({ errorInfo: componentStack });
    Logger.error('ErrorBoundary caught crash', {
      message: error.message,
      stack: error.stack,
      componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#c00' }}>
            Az alkalmazás hibába ütközött
          </Text>
          <Text style={{ fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 10 }}>
            {this.state.error?.message || 'Ismeretlen hiba'}
          </Text>
          <Text style={{ fontSize: 11, color: '#888', textAlign: 'left', fontFamily: 'monospace' }}>
            {this.state.error?.stack?.substring(0, 500) || ''}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

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

  // Register push token when user is logged in
  useEffect(() => {
    if (!user) return;

    const setupPushToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await storage.setItem('expoPushToken', token);
          await registerPushToken(token);
        }
      } catch (_err) {
        // Push token registration failed silently
      }
    };

    setupPushToken();
  }, [user]);

  return children;
}

function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    Logger.init().catch(() => {});
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppThemeProvider>
          <ToastProvider>
            <NavigationThemeWrapper>
              <ProtectedRoute>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="medication/[id]" />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </ProtectedRoute>
            </NavigationThemeWrapper>
          </ToastProvider>
        </AppThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
