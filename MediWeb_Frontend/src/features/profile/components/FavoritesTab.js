import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { getFavorites, removeFromFavorites } from "features/profile/profile.api";
import { toast } from "react-toastify";
import { styles } from "./ProfilesTab.style";

export default function FavoritesTab() {
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
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.tabContent}>
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
              <View key={fav.id} style={styles.profileCard}>
                <View style={styles.profileCardHeader}>
                  <TouchableOpacity onPress={() => window.open(`/medication/${fav.medicationId}`, "_blank")}>
                    <Text style={styles.medicationName}>
                      {index + 1}. {fav.medicationName}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.profileCardActions}>
                    <TouchableOpacity onPress={() => confirmDelete(fav)}>
                      <FontAwesome5 name="trash-alt" size={18} style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
            <Text style={{ color: "#6B7280" }}>
              {selectedFavorite?.medicationName}
            </Text>
            <View style={styles.modalDeleteActions}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButton}>Mégse</Text>
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Törlés</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}