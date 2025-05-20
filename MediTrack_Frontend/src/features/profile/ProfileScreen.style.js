import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    width: "100%",
  },

  header: {
    width: "100vw",
    marginLeft: "calc(-50vw + 50%)",
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
  },

  imageWrapper: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 48,
  },

  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#D1FAE5",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    resizeMode: "cover",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  inlineInfoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 32,
  },

  inlineInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 6,
  },

  label: {
    fontWeight: "500",
    color: "#6B7280",
    fontSize: 14,
    marginRight: 4,
  },

  value: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },

  editIcon: {
    marginLeft: 6,
    color: "#4B5563",
    opacity: 0.7,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#F5F7FA",
    width: "100vw",
    marginLeft: "calc(-50vw + 50%)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 20,
  },

  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  tabButtonActive: {
    borderBottomColor: "#10B981",
    color: "#059669",
  },

  tabContent: {
    width: "90%",
    maxWidth: 1000,
    padding: 24,
  },

  // 🧩 Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modalBox: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 16,
    width: "100%",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },

  cancelButton: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 16,
  },

  saveButton: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },

  uploadButton: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },

  uploadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  previewFilename: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
});