import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme, MIN_TOUCH_TARGET } from "styles/theme";

export default function BackButton({ label = "Vissza" }) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <FontAwesome5 name="arrow-left" size={18} color={theme.colors.textPrimary} />
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
  },
  text: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
});
