// Shared Jest setup for MediWeb_Frontend.
// Mocks Expo/native modules that are not available in the Jest (jsdom/node) test
// environment so that components using them can be rendered in tests without
// making real network calls or crashing on missing native bindings.

jest.mock('expo-router', () => {
  const React = require('react');

  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    setParams: jest.fn(),
    navigate: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  };

  return {
    useRouter: () => router,
    useLocalSearchParams: () => ({}),
    useGlobalSearchParams: () => ({}),
    useSegments: () => [],
    useFocusEffect: (callback) => {
      React.useEffect(() => {
        const cleanup = callback && callback();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, [callback]);
    },
    usePathname: () => '/',
    Link: ({ children }) => children,
    Redirect: () => null,
    Stack: { Screen: () => null },
    Tabs: { Screen: () => null },
  };
});

// Use the package's own official Jest mock for AsyncStorage.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('fake-notification-id')),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: 'ExponentPushToken[fake-test-token]' })
  ),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  SchedulableTriggerInputTypes: {},
}));
