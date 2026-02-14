import { StyleSheet } from "react-native";

export const createStyles = (theme) => StyleSheet.create({
  // --- Általános konténer ---
  tabContent: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  profileListWrapper: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
    gap: theme.borderRadius.md,
  },

  // --- Általános szövegek ---
  noProfilesText: {
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    textAlign: "center",
  },
  noMedicationsText: {
    color: theme.colors.textSecondary,
    marginTop: 10,
    textAlign: "center",
    fontSize: theme.fontSize.sm,
    fontStyle: "italic",
    marginBottom: 20,
  },
  emptyStateContainer: {
    width: "100%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateCard: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    ...theme.shadows.md,
    gap: theme.borderRadius.md,
  },
  emptyStateEmoji: {
    fontSize: 34,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: theme.borderRadius.md,
  },
  sectionHeaderText: {
    fontWeight: theme.fontWeight.bold,
    fontSize: 17,
    color: theme.colors.textPrimary,
  },

  // --- Gombok ---
  addProfileButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.borderRadius.md,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  addProfileButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.base,
  },
  addMedicationButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  addMedicationButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },

  // --- Profilkártya ---
  profileCard: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileCardSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.secondary,
  },
  profileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileCardTitle: {
    fontSize: 17,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  profileCardActions: {
    flexDirection: "row",
    gap: theme.borderRadius.md,
  },
  profileCardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },

  // --- Gyógyszerkártya ---
  medicationCard: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    position: "relative",
    minHeight: 100,
  },

  medicationName: {
    fontSize: 17,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    paddingRight: 80,
    lineHeight: 24,
  },
  medicationActions: {
    position: "absolute",
    bottom: theme.borderRadius.md,
    right: theme.borderRadius.md,
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  medicationNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    paddingRight: 80,
    paddingBottom: 40,
  },
  medicationsWrapper: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: theme.colors.backgroundElevated,
    padding: theme.borderRadius.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // --- Ikon gombok ---
  icon: {
    color: theme.colors.textSecondary,
    padding: theme.spacing.sm,
  },

  // --- Modális ablak (Bottom Sheet style) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Default overlay color
    justifyContent: "flex-end",
  },
  modalDeleteContainer: {
    backgroundColor: theme.colors.backgroundCard,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: 40,
    ...theme.shadows.lg,
  },
  modalDeleteTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  modalDeleteActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.borderRadius.md,
  },
  modalContainer: {
    backgroundColor: theme.colors.backgroundCard,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: 20,
    paddingTop: theme.borderRadius.md,
    paddingBottom: 40,
    maxHeight: "90%",
    ...theme.shadows.lg,
  },
  editMedicationModalContainer: {
    backgroundColor: theme.colors.backgroundCard,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: 0,
    paddingTop: theme.borderRadius.md,
    paddingBottom: 40,
    maxHeight: "90%",
    ...theme.shadows.lg,
  },
  modalContent: {
    paddingBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.borderRadius.md,
    fontSize: 15,
    backgroundColor: theme.colors.backgroundElevated,
    width: "100%",
    marginBottom: theme.borderRadius.md,
    color: theme.colors.textPrimary,
  },
  sectionHeaderTextInModal: {
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: theme.borderRadius.md,
  },
  modalFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  modalFooterLeft: {
    flexShrink: 0,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  modalFooterRight: {
    flexDirection: "row",
    gap: theme.borderRadius.md,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
    textTransform: "uppercase",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
  },

  // --- Emlékeztető rész ---
  reminderGroup: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reminderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  dayList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.sm,
  },
  dayListInline: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "nowrap",
    marginBottom: theme.borderRadius.md,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: theme.colors.backgroundElevated,
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  dayButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  dayButtonTextSelected: {
    color: theme.colors.white,
  },
  reminderTimes: {
    flexDirection: "row",
    gap: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  reminderTimesInline: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "nowrap",
  },
  timeInput: {
    width: 80,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    backgroundColor: theme.colors.backgroundElevated,
    color: theme.colors.textPrimary,
  },
  deleteReminderText: {
    color: theme.colors.error,
    marginTop: 6,
    fontWeight: theme.fontWeight.medium,
  },
  addReminderButton: {
    color: theme.colors.secondary,
    fontSize: 17,
    fontWeight: theme.fontWeight.semibold,
    textAlign: "center",
  },

  // --- Listaelemek ---
  medicationTitle: {
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.base,
    marginBottom: 10,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  medicationListItem: {
    padding: 10,
    backgroundColor: theme.colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  medicationListItemSelected: {
    backgroundColor: theme.colors.primaryMuted,
  },
  medicationList: {
    maxHeight: 200,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    borderRadius: 6,
  },
  noResultsText: {
    textAlign: "center",
    color: theme.colors.textTertiary,
    fontStyle: "italic",
    marginBottom: 10,
  },
  loadingIndicator: {
    marginVertical: 10,
  },

  // --- Assing Modal ---
  assignModalContainer: {
    backgroundColor: theme.colors.backgroundCard,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.borderRadius.md,
    paddingBottom: 40,
    maxHeight: "85%",
    ...theme.shadows.lg,
  },
  assignList: {
    maxHeight: 200,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.borderRadius.md,
  },
  assignModalContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  assignCard: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.borderRadius.md,
    width: "100%",
    maxWidth: 680,
    ...theme.shadows.sm,
  },
  assignCardSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.secondary,
  },
  assignCardTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },

  // --- Intake Tab ---

  intakeTabContent: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "flex-start",
    flexGrow: 1,
  },
  intakeHeaderText: {
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  intakeCard: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.md,
    padding: 20,
    marginBottom: theme.borderRadius.md,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },

  intakeCardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 20,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },

  intakeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.borderRadius.md,
    borderRadius: 6,
    backgroundColor: theme.colors.backgroundElevated,
    marginBottom: theme.spacing.sm,
  },

  intakeTime: {
    fontSize: 15,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    width: 60,
  },

  takenText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.secondary,
    flex: 1,
  },

  notTakenText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
    flex: 1,
  },

  intakeButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  intakeButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
    fontSize: 13,
  },

  intakeButtonProfile: {
    minWidth: 80,
    height: 50,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    backgroundColor: theme.colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.borderRadius.md,
    ...theme.shadows.sm,
  },

  intakeButtonProfileSelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },

  intakeButtonTextProfile: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.base,
  },

  intakeButtonTextProfileSelected: {
    color: theme.colors.white,
  },

  // --- Missed Medications Section ---

  missedSectionHeader: {
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },

  missedScheduledText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },

  missedTimeButton: {
    backgroundColor: theme.colors.backgroundElevated,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 120,
    alignItems: "center",
  },

  missedTimeButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },

  missedSubmitButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: theme.spacing.sm,
  },

  missedSubmitButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.sm,
  },
});
