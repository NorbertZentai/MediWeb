import { StyleSheet, Dimensions } from "react-native";
import { theme } from "styles/theme";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // --- Main Container ---
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  tabContent: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  // --- Header ---
  header: {
    backgroundColor: theme.colors.backgroundCard,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadows.md,
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
    backgroundColor: theme.colors.border,
    borderWidth: 3,
    borderColor: theme.colors.primaryMuted,
  },

  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },

  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // --- Info Cards ---
  infoCardsContainer: {
    gap: 10,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundElevated,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  infoCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoCardContent: {
    flex: 1,
  },

  infoCardLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },

  infoCardValue: {
    fontSize: 15,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },

  infoCardEditButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Tabs ---
  tabsScrollView: {
    backgroundColor: theme.colors.backgroundCard,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
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
    borderRadius: theme.borderRadius.md,
    backgroundColor: "transparent",
  },

  tabButtonActive: {
    backgroundColor: theme.colors.primaryMuted,
  },

  tabLabel: {
    fontSize: 13,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },

  tabLabelActive: {
    color: theme.colors.primary,
  },

  // --- Modal ---
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.components.modal.overlay,
    justifyContent: "flex-end",
    zIndex: 999,
  },

  modalBox: {
    backgroundColor: theme.components.modal.background,
    borderTopLeftRadius: theme.components.modal.borderRadius,
    borderTopRightRadius: theme.components.modal.borderRadius,
    padding: theme.spacing.lg,
    paddingBottom: 40,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.components.modal.handleColor,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },

  modalInput: {
    backgroundColor: theme.components.input.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
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
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },

  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },

  uploadButton: {
    backgroundColor: theme.colors.primaryMuted,
    paddingVertical: 40,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
  },

  uploadText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.base,
    marginTop: 8,
  },

  previewFilename: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },

  // Legacy support
  label: {
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginRight: 4,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  editIcon: {
    marginLeft: 6,
    color: theme.colors.textSecondary,
  },
  inlineInfoRow: {
    display: "none",
  },
  imageOverlay: {
    display: "none",
  },
  inlineInfoItem: {
    display: "none",
  },
});
