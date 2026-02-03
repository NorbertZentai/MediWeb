import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { CustomTabBar } from '@/components/navigation';
import { TAB_BAR_COLORS } from '@/components/navigation/constants';
import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import Navbar from '@/src/components/Navbar';

// Feature flag for easy rollback
const USE_CUSTOM_TAB_BAR = true;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';
  const colors = TAB_BAR_COLORS[colorScheme ?? 'light'];

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
            ? { display: 'none' }
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
