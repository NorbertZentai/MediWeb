import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../ProfilesTab.style";
import { updateProfile } from "features/profile/profile.api";

export default function EditProfileModal({ profile, onClose, onProfileUpdated }) {
  const [name, setName] = useState(profile.name || "");
  const [notes, setNotes] = useState(profile.notes || "");

  useEffect(() => {
    setName(profile.name || "");
    setNotes(profile.notes || "");
  }, [profile]);

  const handleSave = async () => {
    try {
      const updated = await updateProfile(profile.id, name, notes);
      onProfileUpdated(updated);
      onClose();
    } catch (error) {
      console.error("Profil mentése sikertelen:", error);
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil szerkesztése</Text>

            <Text style={styles.modalLabel}>Név</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.modalLabel}>Megjegyzés</Text>
            <TextInput
              style={styles.modalInput}
              value={notes}
              onChangeText={setNotes}
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
          </View>
        </View>
      </View>
    </Modal>
  );
}