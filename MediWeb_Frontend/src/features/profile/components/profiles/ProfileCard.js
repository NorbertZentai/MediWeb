import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { createStyles } from "../ProfilesTab.style";
import { useTheme } from "contexts/ThemeContext";

export default function ProfileCard({ profile, isSelected, onSelect, onEdit, onDelete }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleDelete = async () => {
    try {
      await onDelete();
    } catch (error) {
      console.error("Hiba a törlés során:", error);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.profileCard,
        isSelected && styles.profileCardSelected,
      ]}
      activeOpacity={0.8}
      onPress={onSelect}
    >
      <View style={styles.profileCardHeader}>
        <Text style={styles.profileCardTitle}>{profile.name}</Text>
        <View style={styles.profileCardActions}>
          <TouchableOpacity onPress={() => onEdit(profile)}>
            <FontAwesome5 name="edit" size={16} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <FontAwesome5 name="trash" size={16} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.profileCardDescription}>
        {profile.notes || "Nincs leírás."}
      </Text>
    </TouchableOpacity>
  );
}