import React, { useState, useMemo } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { createStyles } from "../ProfilesTab.style";
import { createProfile } from "features/profile/profile.api";
import { toast } from 'utils/toast';
import { useTheme } from "contexts/ThemeContext";

export default function AddProfileModal({ onClose, onProfileCreated }) {
  const { theme } = useTheme();
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
      <View style={Platform.OS === 'web' ? styles.modalOverlayWeb : styles.modalOverlay}>
        <View style={Platform.OS === 'web' ? styles.modalContainerWeb : styles.modalContainer}>
          <View style={styles.modalHandle} />
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Új profil létrehozása</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Profil neve"
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Leírás (opcionális)"
              placeholderTextColor={theme.colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelButton}>Mégse</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit}>
                <Text style={styles.saveButton}>Mentés</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}