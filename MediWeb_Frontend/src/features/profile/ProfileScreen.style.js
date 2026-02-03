import { StyleSheet, Dimensions } from "react-native";
import { theme } from "styles/theme";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // --- Main Container ---
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for bottom tabs
  },

  tabContent: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  // --- Header ---
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  imageWrapper: {
    position: "relative",
  },

  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5E7EB",
    borderWidth: 3,
    borderColor: "#ECFDF5",
  },

  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },

  // --- Info Cards ---
  infoCardsContainer: {
    gap: 10,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  infoCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoCardContent: {
    flex: 1,
  },

  infoCardLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },

  infoCardValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  infoCardEditButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Tabs ---
  tabsScrollView: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  tabs: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 6,
  },

  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "transparent",
  },

  tabButtonActive: {
    backgroundColor: "#ECFDF5",
  },

  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  tabLabelActive: {
    color: "#2E7D32",
  },

  // --- Modal ---
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 999,
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },

  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 12,
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },

  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  uploadButton: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 40,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2E7D32",
    borderStyle: "dashed",
  },

  uploadText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 16,
    marginTop: 8,
  },

  previewFilename: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },

  // Legacy support
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
  },
  inlineInfoRow: {
    display: "none", // Hide old layout
  },
  imageOverlay: {
    display: "none", // Hide old overlay
  },
  inlineInfoItem: {
    display: "none",
  },
});