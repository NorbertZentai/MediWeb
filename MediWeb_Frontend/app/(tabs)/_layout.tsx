import { Tabs } from 'expo-router';
import React, { useContext } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { CustomTabBar } from '@/components/navigation';
import { TAB_BAR_COLORS } from '@/components/navigation/constants';
import { HapticTab } from '@/components/HapticTab';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AuthContext } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/Navbar';

// Feature flag for easy rollback
const USE_CUSTOM_TAB_BAR = true;
const MOBILE_BREAKPOINT = 768;

export default function TabLayout() {
  const { isDark } = useTheme();
  const { user } = useContext(AuthContext) as { user: any };
  const colorScheme = isDark ? 'dark' : 'light';
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isMobileWeb = isWeb && width < MOBILE_BREAKPOINT;
  const colors = TAB_BAR_COLORS[colorScheme ?? 'light'];
  const isAdmin = user?.role === 'ADMIN';

  // Fix mobile browser viewport: browser bottom bar overlaps tab bar
  // Uses window.innerHeight (always = visible area) instead of CSS vh/dvh units
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const root = document.getElementById('root');
    if (!root) return;

    const updateHeight = () => {
      const h = window.innerHeight;
      root.style.height = h + 'px';
      root.style.maxHeight = h + 'px';
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Show Navbar on web */}
      {isWeb && <Navbar />}

      <Tabs
        tabBar={
          !isWeb && USE_CUSTOM_TAB_BAR
            ? (props) => <CustomTabBar {...props} />
            : undefined
        }
        screenOptions={{
          tabBarActiveTintColor: colors.activeText,
          tabBarInactiveTintColor: colors.inactiveText,
          headerShown: false,
          tabBarButton: USE_CUSTOM_TAB_BAR ? undefined : HapticTab,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarStyle: isWeb
            ? isMobileWeb
              ? {
                  // Mobile web: show bottom tab bar for navigation
                  height: 70,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingHorizontal: 10,
                  backgroundColor: colors.background,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.06)',
                }
              : { display: 'none' } // Desktop web: Navbar handles navigation
            : USE_CUSTOM_TAB_BAR
              ? { display: 'none' } // Hide default tab bar when using custom
              : {
                  height: 70,
                  paddingTop: 8,
                  paddingBottom: Platform.OS === 'ios' ? 24 : 12,
                  backgroundColor: colors.background,
                  borderTopWidth: 0,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 12,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Főoldal',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: colors.activePill }]}>
                <FontAwesome5 name="home" size={20} color={color} solid={focused} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Keresés',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: colors.activePill }]}>
                <FontAwesome5 name="search" size={20} color={color} solid={focused} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Kedvenc',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: colors.activePill }]}>
                <FontAwesome5 name="heart" size={20} color={color} solid={focused} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: colors.activePill }]}>
                <FontAwesome5 name="user" size={20} color={color} solid={focused} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Beállít.',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: colors.activePill }]}>
                <FontAwesome5 name="cog" size={20} color={color} solid={focused} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            href: isAdmin ? '/admin' : null,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && { backgroundColor: colors.activePill }]}>
                <FontAwesome5 name="shield-alt" size={20} color={color} solid={focused} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
