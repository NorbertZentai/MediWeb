import React, { useState, useEffect, useMemo } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { createStyles } from "../ProfilesTab.style";
import { updateProfile } from "features/profile/profile.api";
import { useTheme } from "contexts/ThemeContext";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";

export default function EditProfileModal({ profile, onClose, onProfileUpdated }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsiveLayout();
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
      <View testID="edit-profile-modal-overlay" style={isMobile ? styles.modalOverlay : styles.modalOverlayWeb}>
        <View testID="edit-profile-modal-container" style={isMobile ? styles.modalContainer : styles.modalContainerWeb}>
          <View style={styles.modalHandle} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil szerkesztése</Text>

            <Text style={styles.sectionHeaderTextInModal}>Név</Text>
            <TextInput
              style={styles.modalInput}
              accessibilityLabel="Név"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.sectionHeaderTextInModal}>Megjegyzés</Text>
            <TextInput
              style={styles.modalInput}
              accessibilityLabel="Megjegyzés"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.touchTarget}
                accessibilityRole="button"
                accessibilityLabel="Mégse"
              >
                <Text style={styles.cancelButton}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.touchTarget}
                accessibilityRole="button"
                accessibilityLabel="Mentés"
              >
                <Text style={styles.saveButton}>Mentés</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}