import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { theme } from "../theme";

export default function MedicationScreen() {
  const exampleMedications = [
    { name: "Paracetamol", dose: "500mg", frequency: "3x naponta" },
    { name: "Ibuprofen", dose: "400mg", frequency: "2x naponta" },
    { name: "Amoxicillin", dose: "250mg", frequency: "2x naponta" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gyógyszerek modul</Text>
      <Text style={styles.description}>
        Itt jelenik meg a gyógyszer-lista, részletek, stb.
      </Text>
      <ScrollView style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Gyógyszer neve</Text>
          <Text style={styles.tableHeaderCell}>Adag</Text>
          <Text style={styles.tableHeaderCell}>Gyakoriság</Text>
        </View>
        {exampleMedications.map((medication, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            ]}
          >
            <Text style={styles.tableCell}>{medication.name}</Text>
            <Text style={styles.tableCell}>{medication.dose}</Text>
            <Text style={styles.tableCell}>{medication.frequency}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
    textAlign: "center",
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
  },
  tableRowEven: {
    backgroundColor: "#F9F9F9",
  },
  tableRowOdd: {
    backgroundColor: "#FFFFFF",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    color: "#555",
  },
});
