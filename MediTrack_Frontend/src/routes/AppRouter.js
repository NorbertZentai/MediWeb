import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import HomeScreen from "features/home/HomeScreen";
import LoginScreen from "features/auth/LoginScreen";
import RegisterScreen from "features/auth/RegisterScreen";
import UserScreen from "features/profile/ProfileScreen";
import MedicationDetailScreen from "features/medication/MedicationScreen";
import SearchScreen from "features/search/SearchScreen";

import Navbar from "components/Navbar";
import { theme } from "styles/theme";
import { AuthContext } from "contexts/AuthContext";

export default function AppRouter() {
  const { loading } = useContext(AuthContext);

  // Betöltés alatti spinner
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
              <Route path="*" element={<Text style={styles.errorText}> 404 – A keresett oldal nem található. </Text> } />
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
    zIndex: 1000,
  },
  content: {
    flex: 1,
    width: "70%",
    backgroundColor: theme.colors.white,
    padding: 16,
    paddingHorizontal: 16,
    paddingTop: 0,
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
  errorText: {
    fontSize: 18,
    color: theme.colors.red600,
    textAlign: "center",
    marginTop: 24,
  },
});