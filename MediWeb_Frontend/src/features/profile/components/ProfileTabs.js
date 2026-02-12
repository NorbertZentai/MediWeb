import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { createStyles } from "../ProfileScreen.style";
import { useTheme } from "contexts/ThemeContext";

const tabs = [
  { key: "profiles", label: "Profilok", icon: "user-friends" },
  { key: "favorites", label: "Kedvencek", icon: "star" },
  { key: "intake", label: "Bevitel", icon: "pills" },
  { key: "statistics", label: "Statisztikák", icon: "chart-bar" },
  { key: "settings", label: "Beállítások", icon: "cog" },
];

export default function ProfileTabs({ selectedTab, onTabChange }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
      style={styles.tabsScrollView}
    >
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name={tab.icon}
              size={14}
              color={isActive ? theme.colors.primary : theme.colors.textTertiary}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}