import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styles } from "../ProfilesTab.style";
import {
  addMedicationToProfile,
  searchMedicationsByName,
} from "features/profile/profile.api";

export default function AssignMedicationModal({ profileId, onClose, onAssigned }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await searchMedicationsByName(search.trim());
        setResults(response);
      } catch (e) {
        console.error("Keresési hiba:", e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleAssign = async () => {
    if (!selected) {
      Alert.alert("Hiba", "Válassz ki egy gyógyszert!");
      return;
    }

    try {
      const result = await addMedicationToProfile(profileId, selected.itemId);
      onAssigned(result);
      onClose();
    } catch (error) {
      console.error("Hozzárendelési hiba:", error);
      Alert.alert("Hiba", "Nem sikerült hozzárendelni a gyógyszert.");
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Gyógyszer hozzárendelése</Text>

        <TextInput
          style={styles.modalInput}
          placeholder="Keresés név alapján..."
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#10B981"
            style={styles.loadingIndicator}
          />
        ) : (
          <>
            <FlatList
              data={results}
              keyExtractor={(item) => item.itemId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.medicationListItem,
                    selected?.itemId === item.itemId && styles.medicationListItemSelected,
                  ]}
                  onPress={() => setSelected(item)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.medicationList}
              keyboardShouldPersistTaps="handled"
            />
            {results.length === 0 && search.trim() !== "" && !loading && (
              <Text style={styles.noResultsText}>Nincs találat.</Text>
            )}
          </>
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Mégse</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAssign}
            disabled={!selected}
          >
            <Text style={[styles.saveButton, !selected && styles.disabledButton]}>
              Hozzáadás
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}