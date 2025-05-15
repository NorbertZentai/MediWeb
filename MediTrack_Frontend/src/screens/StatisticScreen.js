import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatisticScreen() {
  const statistics = [
    { label: "Összes gyógyszer", value: 128 },
    { label: "Aktív felhasználók", value: 78 },
    { label: "Legnépszerűbb gyógyszer", value: "Aspirin" },
    { label: "Kedvenc gyógyszerek száma", value: 45 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statisztikák modul</Text>
      <View style={styles.statsContainer}>
        {statistics.map((stat, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{stat.label}</Text>
            <Text style={styles.cardValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  statsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    margin: 8,
    width: "40%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 18,
    color: "#4CAF50",
    textAlign: "center",
  },
});
