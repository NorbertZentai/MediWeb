import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "contexts/ThemeContext";

export default function GuestLoginBanner({ message = "A funkció használatához bejelentkezés szükséges." }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundCard, borderColor: theme.colors.border }]}>
      <FontAwesome5 name="lock" size={14} color={theme.colors.textSecondary} style={styles.icon} />
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push("/login")}
        >
          <Text style={[styles.buttonText, { color: theme.colors.white }]}>Bejelentkezés</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline, { borderColor: theme.colors.primary }]}
          onPress={() => router.push("/register")}
        >
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Regisztráció</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  message: {
    flex: 1,
    fontSize: 13,
    minWidth: 120,
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
