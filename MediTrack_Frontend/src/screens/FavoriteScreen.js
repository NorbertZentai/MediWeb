import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

const favoriteMedications = [
  { id: "1", name: "Paracetamol", description: "Láz- és fájdalomcsillapító" },
  { id: "2", name: "Ibuprofen", description: "Gyulladáscsökkentő és fájdalomcsillapító" },
  { id: "3", name: "Vitamin C", description: "Immunerősítő vitamin" },
];

export default function FavoriteScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.medicationName}>{item.name}</Text>
      <Text style={styles.medicationDescription}>{item.description}</Text>
      <TouchableOpacity style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Eltávolítás</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kedvencek modul</Text>
      <Text style={styles.description}>Itt jelennek meg a felhasználó kedvenc gyógyszerei.</Text>
      <FlatList
        data={favoriteMedications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#E8F5E9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    elevation: 3,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  medicationDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: "#FF6F61",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
