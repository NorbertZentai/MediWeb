import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { toast } from "react-toastify";
import { styles } from "../ProfilesTab.style";
import {
  updateMedicationNote,
  removeMedicationFromProfile,
  addMedicationToProfile,
  searchMedicationsByName,
} from "features/profile/profile.api";

export default function EditMedicationModal({ profileId, medication, onClose, onUpdated, onDeleted }) {
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medication && medication.notes) {
      setNote(medication.notes);
    }
  }, [medication]);

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
        toast.error("Nem sikerült lekérni a gyógyszereket.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSave = async () => {
    try {
      const updated = await updateMedicationNote(profileId, medication.itemId, note);
      toast.success("Gyógyszer frissítve.");
      onUpdated(updated);
      onClose();
    } catch (error) {
      console.error("Frissítési hiba:", error);
      toast.error("Nem sikerült frissíteni a gyógyszert.");
    }
  };

  const handleDelete = async () => {
    try {
      await removeMedicationFromProfile(profileId, medication.itemId);
      toast.success("Gyógyszer törölve.");
      onDeleted(medication.itemId);
      onClose();
    } catch (error) {
      console.error("Törlési hiba:", error);
      toast.error("Nem sikerült törölni a gyógyszert.");
    }
  };

  const handleAssign = async () => {
    if (!selected) {
      toast.error("Válassz ki egy gyógyszert!");
      return;
    }

    try {
      const result = await addMedicationToProfile(profileId, selected.itemId);
      toast.success("Gyógyszer sikeresen hozzárendelve.");
      onUpdated(result);
      setSelected(null);
      setSearch("");
    } catch (error) {
      console.error("Hozzárendelési hiba:", error);
      toast.error("Nem sikerült hozzárendelni a gyógyszert.");
    }
  };

  if (!medication) {
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Nincs hozzárendelt gyógyszer</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Keresés név alapján..."
            value={search}
            onChangeText={setSearch}
          />

          {loading ? (
            <ActivityIndicator size="small" color="#10B981" style={styles.loadingIndicator} />
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
            <TouchableOpacity onPress={handleAssign} disabled={!selected}>
              <Text style={[styles.saveButton, !selected && styles.disabledButton]}>Hozzáadás</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Gyógyszer szerkesztése</Text>
        <Text style={styles.medicationTitle}>{medication.name}</Text>

        <TextInput
          style={styles.modalInput}
          value={note}
          onChangeText={setNote}
          placeholder="Megjegyzés..."
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

        <View style={styles.deleteButtonContainer}>
          <Button title="Törlés" onPress={handleDelete} color="#d32f2f" />
        </View>
      </View>
    </View>
  );
}