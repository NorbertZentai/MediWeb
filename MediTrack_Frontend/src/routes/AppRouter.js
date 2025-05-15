import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { View, StyleSheet, ActivityIndicator } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import UserScreen from "../screens/UserScreen";
import MedicationDetailScreen from "../screens/MedicationDetailScreen";
import SearchScreen from "../screens/SearchScreen";
import FavoriteScreen from "../screens/FavoriteScreen";
import StatisticScreen from "../screens/StatisticScreen";
import Navbar from "../components/Navbar";
import { theme } from "../theme";
import { AuthContext } from "../context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";

export default function AppRouter() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66BB6A" />
      </View>
    );
  }

  return (
    <Router>
      <View style={styles.container}>
        <View style={styles.navbarWrapper}>
          <Navbar />
        </View>

        <ScrollView>
          <View style={styles.content}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/user" element={<UserScreen />} />
              <Route path="/medication/:itemId" element={<MedicationDetailScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/favorites" element={<FavoriteScreen />} />
              <Route path="/statistics" element={<StatisticScreen />} />
              <Route path="*" element={<h2>404 - A keresett oldal nem található.</h2>} />
            </Routes>
          </View>
        </ScrollView>
      </View>
    </Router>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
  },
  navbarWrapper: {
    width: "100%",
    height: theme.dimensions.navbarHeight,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    width: "70%",
    backgroundColor: theme.colors.white,
    padding: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
