import React from "react";
import { View, Modal, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { theme } from "styles/theme";

export default function BottomSheet({ visible, onClose, children, maxHeight = "90%" }) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <Pressable style={[styles.container, { maxHeight }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            {children}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.components.modal.overlay,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: theme.components.modal.background,
    borderTopLeftRadius: theme.components.modal.borderRadius,
    borderTopRightRadius: theme.components.modal.borderRadius,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.components.modal.handleColor,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
});
