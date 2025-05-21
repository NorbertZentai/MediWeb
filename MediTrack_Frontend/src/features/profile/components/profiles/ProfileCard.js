import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../ProfilesTab.style";

export default function ProfileCard({ profile, isSelected, onSelect, onEdit, onDelete }) {
  return (
    <TouchableOpacity
      style={[
        styles.profileCard,
        isSelected && styles.profileCardSelected,
      ]}
      onPress={onSelect}
    >
      <View style={styles.profileCardHeader}>
        <Text style={styles.profileCardTitle}>{profile.name}</Text>

        <View style={styles.profileCardActions}>
          <TouchableOpacity onPress={onEdit}>
            <FontAwesome5 name="edit" size={16} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete}>
            <FontAwesome5 name="trash" size={16} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.profileCardDescription}>
        {profile.description || "Nincs leírás."}
      </Text>
    </TouchableOpacity>
  );
}