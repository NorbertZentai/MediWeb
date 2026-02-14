import React, { useState, useEffect, useMemo } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { createStyles } from "../ProfilesTab.style";
import { updateProfile } from "features/profile/profile.api";
import { useTheme } from "contexts/ThemeContext";

export default function EditProfileModal({ profile, onClose, onProfileUpdated }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={Platform.OS === 'web' ? styles.modalOverlayWeb : styles.modalOverlay}>
        <View style={Platform.OS === 'web' ? styles.modalContainerWeb : styles.modalContainer}>
          <View style={styles.modalHandle} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil szerkesztése</Text>

            <Text style={styles.sectionHeaderTextInModal}>Név</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.sectionHeaderTextInModal}>Megjegyzés</Text>
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