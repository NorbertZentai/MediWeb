import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { getFavorites, removeFromFavorites } from "features/profile/profile.api";
import { toast } from 'utils/toast';
import { createStyles } from "./ProfilesTab.style";
import { useTheme } from "contexts/ThemeContext";

export default function FavoritesTab() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchFavoritesList();
  }, []);

  const fetchFavoritesList = async () => {
    setLoading(true);
    try {
      const res = await getFavorites();
      setFavorites(res);
    } catch (err) {
      console.error("Hiba a kedvencek betöltésekor:", err);
      toast.error("Nem sikerült betölteni a kedvenceket.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (fav) => {
    setSelectedFavorite(fav);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await removeFromFavorites(selectedFavorite.id);
      toast.success("Kedvenc törölve.");
      setFavorites((prev) => prev.filter((f) => f.id !== selectedFavorite.id));
    } catch (err) {
      console.error("Hiba a kedvenc törlésekor:", err);
      toast.error("Törlés sikertelen.");
    } finally {
      setModalVisible(false);
      setSelectedFavorite(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.tabContent}>
        {favorites.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateEmoji}>⭐️</Text>
              <Text style={styles.emptyStateTitle}>Még nincs kedvenc gyógyszer</Text>
              <Text style={styles.emptyStateSubtitle}>
                A gyógyszer adatlapján a szív ikonra kattintva felveheted a gyorsan elérhető listádba.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.profileListWrapper}>
            {favorites.map((fav, index) => (
              <View key={fav.id} style={styles.profileCardWrapper}>
              <View style={styles.profileCard}>
                <View style={styles.profileCardHeader}>
                  <TouchableOpacity
                    onPress={() => router.push(`/medication/${fav.medicationId}`)}
                    style={styles.medicationTitleButton}
                    accessibilityRole="button"
                    accessibilityLabel={`${fav.medicationName} megnyitása`}
                  >
                    <Text style={styles.medicationName}>
                      {index + 1}. {fav.medicationName}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.profileCardActions}>
                    <TouchableOpacity
                      onPress={() => confirmDelete(fav)}
                      style={styles.touchTarget}
                      accessibilityRole="button"
                      accessibilityLabel={`Törlés: ${fav.medicationName}`}
                    >
                      <FontAwesome5 name="trash-alt" size={18} style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Modal törlés megerősítéshez */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDeleteContainer}>
            <Text style={styles.modalDeleteTitle}>
              Biztosan törölni szeretnéd ezt a kedvencet?
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>
              {selectedFavorite?.medicationName}
            </Text>
            <View style={styles.modalDeleteActions}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.touchTarget}
                accessibilityRole="button"
                accessibilityLabel="Mégse"
              >
                <Text style={styles.cancelButton}>Mégse</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={[styles.deleteButton, styles.touchTarget]}
                accessibilityRole="button"
                accessibilityLabel={`Törlés: ${selectedFavorite?.medicationName ?? "kedvenc"}`}
              >
                <Text style={styles.deleteButtonText}>Törlés</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}