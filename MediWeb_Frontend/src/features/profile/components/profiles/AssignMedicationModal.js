import React, { useEffect, useState } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { toast } from 'utils/toast';
import { getFavorites, addMedicationToProfile, getMedicationsForProfile } from "features/profile/profile.api";
import { styles } from "../ProfilesTab.style";

export default function AssignMedicationModal({ profileId, visible, onClose, onAssigned }) {
  const [favorites, setFavorites] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchFavorites();
      setSelectedIds([]);
    }
  }, [visible]);

  const fetchFavorites = async () => {
    try {
      const [favoritesRes, profileMedsRes] = await Promise.all([
        getFavorites(),
        getMedicationsForProfile(profileId),
      ]);

      const assignedIds = profileMedsRes.map((med) => med.medicationId);

      const filteredFavorites = favoritesRes.filter(
        (fav) => !assignedIds.includes(fav.medicationId)
      );

      setFavorites(filteredFavorites);
    } catch (error) {
      console.error("Hiba a kedvencek vagy profil gyógyszerek betöltésekor:", error);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Nincs kiválasztott gyógyszer.");
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((itemId) => addMedicationToProfile(profileId, itemId))
      );
      toast.success("Gyógyszerek sikeresen hozzáadva.");
      onAssigned(selectedIds);
      onClose();
    } catch (err) {
      console.error("Hiba a gyógyszerek hozzárendelésekor:", err);
      toast.error("Nem sikerült hozzáadni a gyógyszereket.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.assignModalContainer}>
          <View style={styles.modalHandle} />
          <View style={styles.assignModalContent}>
            <Text style={styles.modalTitle}>Kedvenc gyógyszerek</Text>
            <ScrollView style={styles.assignList}>
              {favorites.map((med, index) => (
                <Pressable
                  key={med.id}
                  onPress={() => toggleSelect(med.medicationId)}
                  style={[
                    styles.assignCard,
                    selectedIds.includes(med.medicationId) &&
                    styles.assignCardSelected,
                  ]}
                >
                  <Text style={styles.assignCardTitle}>
                    {index + 1}. {med.medicationName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelButton}>Mégse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAssign}
                disabled={selectedIds.length === 0}
                style={[
                  selectedIds.length === 0 && styles.disabledButton,
                ]}
              >
                <Text style={styles.saveButton}>Hozzáadás</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}