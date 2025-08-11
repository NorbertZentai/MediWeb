import React, { useState } from "react";
import { View } from "react-native";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import ProfilesTab from "./components/ProfilesTab";
import FavoritesTab from "./components/FavoritesTab";
import IntakeTab from "./components/IntakeTab";
import SettingsTab from "./components/SettingsTab";
import { styles } from "./ProfileScreen.style";

export default function ProfileScreen() {
  const [selectedTab, setSelectedTab] = useState("profiles");

  const renderTabContent = () => {
    switch (selectedTab) {
      case "favorites":
        return <FavoritesTab />;
      case "settings":
        return <SettingsTab />;
      case "intake":
        return <IntakeTab />;
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