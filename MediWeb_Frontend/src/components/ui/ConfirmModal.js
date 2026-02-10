import React from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "styles/theme";

export default function ConfirmModal({
  visible,
  title,
  subtitle,
  onConfirm,
  onCancel,
  confirmLabel = "Törlés",
  confirmVariant = "danger",
}) {
  const confirmBg =
    confirmVariant === "danger"
      ? theme.components.button.dangerBg
      : theme.components.button.primaryBg;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <FontAwesome5
            name="exclamation-triangle"
            size={28}
            color={theme.colors.warning}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Mégse</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, { backgroundColor: confirmBg }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.components.modal.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  container: {
    backgroundColor: theme.components.modal.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
});
