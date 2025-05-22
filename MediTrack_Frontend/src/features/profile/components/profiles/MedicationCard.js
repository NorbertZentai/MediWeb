import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { toast } from "react-toastify";
import { styles } from "../ProfilesTab.style";

export default function MedicationCard({ medication, onEditNote, onDelete, onReminder }) {
  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success("Gyógyszer törölve.");
    } catch (error) {
      console.error("Hiba a törlés során:", error);
      toast.error("Nem sikerült törölni a gyógyszert.");
    }
  };

  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <Text style={styles.medicationName}>{medication.medicationName}</Text>

        <View style={styles.medicationActions}>
          <TouchableOpacity onPress={onReminder}>
            <FontAwesome5 name="bell" size={16} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEditNote}>
            <FontAwesome5 name="edit" size={16} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <FontAwesome5 name="trash" size={16} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.medicationNote}>
        {medication.note || "Nincs megjegyzés."}
      </Text>
    </View>
  );
}