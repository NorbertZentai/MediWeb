import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "styles/theme";

export default function SectionCard({ children, style, maxWidth = 680 }) {
  return (
    <View style={[styles.card, { maxWidth }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: theme.components.card.background,
    borderRadius: theme.components.card.borderRadius,
    padding: theme.components.card.padding,
    borderWidth: 1,
    borderColor: theme.components.card.border,
    ...theme.components.card.shadow,
  },
});
