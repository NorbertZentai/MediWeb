import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { styles } from "../ProfilesTab.style";
import { createProfile } from "features/profile/profile.api";

export default function AddProfileModal({ onClose, onProfileCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if(!name.trim()) {
      Alert.alert("Hiba", "A név megadása kötelező.");
      return;
    }

    try {
      const newProfile = await createProfile( name, description );
      onProfileCreated(newProfile);
    } catch (error) {
      console.error("Error creating profile:", error);
      Alert.alert("Hiba", "Profil létrehozása sikertelen.");
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Új profil létrehozása</Text>

        <TextInput
          style={styles.modalInput}
          placeholder="Profil neve"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.modalInput}
          placeholder="Leírás (opcionális)"
          value={description}
          onChangeText={setDescription}
        />

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
  );
}