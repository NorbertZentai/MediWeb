import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { styles } from "../ProfilesTab.style";
import { theme } from "styles/theme";

export default function MedicationCard({ medication, onEditNote, onDelete }) {
  const handleDelete = async () => {
    try {
      await onDelete();
    } catch (error) {
      console.error("Hiba a törlés során:", error);
    }
  };

  const openMedicationPage = () => {
    // Use expo-router for navigation (works on mobile and web)
    router.push(`/medication/${medication.medicationId}`);
  };

  return (
    <View style={styles.medicationCard}>
      {/* Title - Full Width */}
      <TouchableOpacity onPress={openMedicationPage}>
        <Text style={styles.medicationName}>{medication.medicationName}</Text>
      </TouchableOpacity>

      {/* Description - Full Width */}
      <Text style={styles.medicationNote}>
        {medication.notes || "Nincs megjegyzés."}
      </Text>

      {/* Actions - Bottom Right */}
      <View style={styles.medicationActions}>
        <TouchableOpacity
          onPress={onEditNote}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.6}
        >
          <FontAwesome5
            name="edit"
            size={18}
            style={{ ...styles.icon, color: theme.colors.info }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.6}
        >
          <FontAwesome5
            name="trash"
            size={18}
            style={{ ...styles.icon, color: theme.colors.error }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
