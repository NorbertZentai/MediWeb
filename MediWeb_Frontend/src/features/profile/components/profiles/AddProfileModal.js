import React, { useState, useMemo } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { createStyles } from "../ProfilesTab.style";
import { createProfile } from "features/profile/profile.api";
import { toast } from 'utils/toast';
import { useTheme } from "contexts/ThemeContext";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";

export default function AddProfileModal({ onClose, onProfileCreated }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsiveLayout();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Kötelező megadni profil nevet.");
      return;
    }

    try {
      const newProfile = await createProfile(name, description);
      onProfileCreated(newProfile);
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error(error.response?.data?.message || "Nem sikerült létrehozni a profilt.");
    }
  };

  return (
    <Modal visible={true} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View testID="add-profile-modal-overlay" style={isMobile ? styles.modalOverlay : styles.modalOverlayWeb}>
        <View testID="add-profile-modal-container" style={isMobile ? styles.modalContainer : styles.modalContainerWeb}>
          <View style={styles.modalHandle} />
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Új profil létrehozása</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Profil neve"
              accessibilityLabel="Profil neve"
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Leírás (opcionális)"
              accessibilityLabel="Leírás (opcionális)"
              placeholderTextColor={theme.colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </ScrollView>

          <View style={styles.modalFooter}>
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
                onPress={handleSubmit}
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