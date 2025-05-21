import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Button } from "react-native";
import { styles } from "../ProfilesTab.style";
import {
  updateMedicationNote,
  removeMedicationFromProfile,
} from "features/profile/profile.api";

export default function EditMedicationModal({ profileId, medication, onClose, onUpdated, onDeleted }) {
  const [note, setNote] = useState(medication.note || "");

  const handleSave = async () => {
    try {
      const updated = await updateMedicationNote(profileId, medication.itemId, note);
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error("Frissítési hiba:", error);
      Alert.alert("Hiba", "Nem sikerült frissíteni a gyógyszert.");
    }
  };

  const handleDelete = async () => {
    try {
      await removeMedicationFromProfile(profileId, medication.itemId);
      onDeleted(medication.itemId);
      onClose();
    } catch (error) {
      console.error("Törlési hiba:", error);
      Alert.alert("Hiba", "Nem sikerült törölni a gyógyszert.");
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Gyógyszer szerkesztése</Text>
        <Text style={styles.medicationTitle}>{medication.name}</Text>

        <TextInput
          style={styles.modalInput}
          value={note}
          onChangeText={setNote}
          placeholder="Megjegyzés..."
          multiline
        />

        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Mégse</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Mentés</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deleteButtonContainer}>
          <Button title="Törlés" onPress={handleDelete} color="#d32f2f" />
        </View>
      </View>
    </View>
  );
}