import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { toast } from "react-toastify";
import { styles } from "../ProfilesTab.style";

export default function ProfileCard({ profile, isSelected, onSelect, onEdit, onDelete }) {
  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success("Profil törölve.");
    } catch (error) {
      console.error("Hiba a törlés során:", error);
      toast.error("Nem sikerült törölni a profilt.");
    }
  };

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