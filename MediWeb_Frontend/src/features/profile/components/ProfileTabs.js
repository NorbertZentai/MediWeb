import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../ProfileScreen.style";

const tabs = [
  { key: "profiles", label: "Profilok" },
  { key: "favorites", label: "Kedvencek" },
  { key: "intake", label: "Bevitel" },
  { key: "statistics", label: "Statisztikák" },
  { key: "settings", label: "Beállítások" },
];

export default function ProfileTabs({ selectedTab, onTabChange }) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            selectedTab === tab.key && styles.tabButtonActive,
          ]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
            style={[styles.tabLabel, selectedTab === tab.key && styles.tabLabelActive]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}