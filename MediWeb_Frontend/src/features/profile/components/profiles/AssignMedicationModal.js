import React, { useEffect, useState, useMemo } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { toast } from 'utils/toast';
import { getFavorites, addMedicationToProfile, getMedicationsForProfile } from "features/profile/profile.api";
import { createStyles } from "../ProfilesTab.style";
import { useTheme } from "contexts/ThemeContext";

export default function AssignMedicationModal({ profileId, visible, onClose, onAssigned }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      if (!profileId) {
        // Ha nincs profil ID, ne töltsük be a gyógyszereket
        // Ez előfordulhat, ha bezárás közben fut le a useEffect vagy initial renderkor
        return;
      }

      // Check if getMedicationsForProfile is actually a function
      if (typeof getMedicationsForProfile !== 'function') {
        console.error("getMedicationsForProfile is not a function");
        return;
      }

      // Először próbáljuk meg külön lekérni, hátha egyik hibázik
      let favoritesRes = [];
      try {
        favoritesRes = await getFavorites();
      } catch (e) {
        console.error("Hiba a kedvencek lekérésekor:", e);
        // Itt nem return-ölünk, mert lehet, hogy csak üres a lista
      }

      let profileMedsRes = [];
      try {
        profileMedsRes = await getMedicationsForProfile(profileId);
      } catch (e) {
        console.error("Hiba a profil gyógyszerek lekérésekor:", e);
        // Itt sem return-ölünk feltétlenül
      }

      const assignedIds = Array.isArray(profileMedsRes) ? profileMedsRes.map((med) => med.medicationId) : [];

      if (Array.isArray(favoritesRes)) {
        const filteredFavorites = favoritesRes.filter(
          (fav) => !assignedIds.includes(fav.medicationId)
        );
        setFavorites(filteredFavorites);
      } else {
        setFavorites([]);
      }

    } catch (error) {
      console.error("Általános hiba a modal betöltésekor:", error);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      toast.warn("Nincs kiválasztott gyógyszer.");
      return;
    }

    try {
      // Itt a logika: Promise.allSettled helyett lehet sorban is, vagy egyszerre
      // A meglévő logika jó volt, csak az importokat kellett ellenőrizni
      // Mivel a `addMedicationToProfile` importálva van, használhatjuk

      const results = await Promise.allSettled(
        selectedIds.map((itemId) => addMedicationToProfile(profileId, itemId))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const duplicates = results.filter(
        (r) => r.status === "rejected" && r.reason?.response?.status === 409
      ).length;
      const failed = results.filter(
        (r) => r.status === "rejected" && r.reason?.response?.status !== 409
      ).length;

      if (succeeded > 0 && duplicates === 0 && failed === 0) {
        toast.success("Gyógyszerek sikeresen hozzáadva.");
      } else if (succeeded > 0 && duplicates > 0) {
        toast.warn(`${succeeded} hozzáadva, ${duplicates} már szerepelt a profilban.`);
      } else if (duplicates > 0 && succeeded === 0) {
        toast.warn("Minden kiválasztott gyógyszer már szerepel a profilban.");
      } else if (failed > 0) {
        toast.error("Nem sikerült hozzáadni néhány gyógyszert.");
      }

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
              {favorites.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
                  Nincsenek elérhető kedvenc gyógyszerek (vagy már mind hozzá lett adva).
                </Text>
              ) : (
                favorites.map((med, index) => (
                  <Pressable
                    key={med.id || index}
                    onPress={() => med.medicationId && toggleSelect(med.medicationId)}
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
                ))
              )}
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