import { StyleSheet } from "react-native";

export const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
    gap: 16,
  },
  section: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  subsectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  subsectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: theme.colors.primaryMuted || theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + "30",
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.primary,
    lineHeight: 18,
  },
  comingSoonText: {
    fontSize: 13,
    color: theme.colors.primaryDark,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  fieldColumn: {
    gap: 12,
  },
  fieldTextWrapper: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  fieldHelper: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  switchWrapper: {
    paddingLeft: 12,
  },
  pillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    borderWidth: 1,
    borderColor: theme.colors.border || theme.colors.borderDark,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.backgroundElevated,
  },
  pillActive: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.primaryMuted,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  pillLabelActive: {
    color: theme.colors.primaryDark || theme.colors.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border || theme.colors.borderDark,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: theme.colors.backgroundElevated,
    color: theme.colors.textPrimary,
  },
  inlineInputs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  inlineInputWrapper: {
    flexShrink: 0,
    minWidth: 160,
    gap: 8,
  },
  inlineLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  footer: {
    marginTop: 8,
    gap: 8,
    alignItems: "flex-end",
  },
  lastSavedText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.base,
  },
  actionButton: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border || theme.colors.borderDark,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: theme.colors.backgroundElevated,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  dangerButton: {
    backgroundColor: theme.colors.favoriteLight,
    borderColor: theme.colors.favoriteLight,
  },
  dangerButtonText: {
    color: theme.colors.error,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: theme.colors.favoriteLight,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.favoriteLight,
  },
  logoutButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
  },
});
