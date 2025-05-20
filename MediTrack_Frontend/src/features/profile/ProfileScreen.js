import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfilesTab from "./ProfilesTab";
import FavoritesTab from "./FavoritesTab";
import SettingsTab from "./SettingsTab";

export default function ProfileScreen() {
  const [selectedTab, setSelectedTab] = useState("profiles");

  const renderTabContent = () => {
    switch (selectedTab) {
      case "favorites":
        return <FavoritesTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <ProfilesTab />;
    }
  };

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <ProfileTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
      <View style={styles.tabContent}>{renderTabContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignSelf: "stretch",
    alignItems: "stretch",
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
});