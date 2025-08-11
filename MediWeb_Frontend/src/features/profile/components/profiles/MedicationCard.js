import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../ProfilesTab.style";

export default function MedicationCard({ medication, onEditNote, onDelete }) {
  const handleDelete = async () => {
    try {
      await onDelete();
    } catch (error) {
      console.error("Hiba a törlés során:", error);
    }
  };

  const openMedicationPage = () => {
    const url = `${window.location.origin}/medication/${medication.medicationId}`;
    window.open(url, "_blank");
  };

  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <TouchableOpacity onPress={openMedicationPage}>
          <Text style={styles.medicationName}> {medication.medicationName} </Text>
        </TouchableOpacity>
        <View style={styles.medicationActions}>
          <TouchableOpacity onPress={onEditNote}>
            <FontAwesome5
              name="edit"
              size={16}
              style={{ ...styles.icon, color: "#2563EB" }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <FontAwesome5
              name="trash"
              size={16}
              style={{ ...styles.icon, color: "#DC2626" }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.medicationNote}>
        {medication.notes || "Nincs megjegyzés."}
      </Text>
    </View>
  );
}