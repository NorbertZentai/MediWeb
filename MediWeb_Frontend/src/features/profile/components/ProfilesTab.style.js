import { StyleSheet } from "react-native";
import { nodeModuleNameResolver } from "typescript";

export const styles = StyleSheet.create({
  // --- Általános konténer ---
  tabContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
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
    gap: 12,
  },

  // --- Általános szövegek ---
  noProfilesText: {
    color: "#9CA3AF",
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
  noMedicationsText: {
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
    gap: 12,
  },
  emptyStateEmoji: {
    fontSize: 34,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  sectionHeaderText: {
    fontWeight: "700",
    fontSize: 17,
    color: "#111827",
  },

  // --- Gombok ---
  addProfileButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
  },
  addProfileButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  addMedicationButton: {
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  addMedicationButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // --- Profilkártya ---
  profileCard: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileCardSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  profileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  profileCardActions: {
    flexDirection: "row",
    gap: 12,
  },
  profileCardDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  // --- Gyógyszerkártya ---
  medicationCard: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    elevation: 1,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    textDecorationLine: "none",
    cursor: "pointer",
  },
  medicationActions: {
    flexDirection: "row",
    gap: 12,
  },
  medicationNote: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 20,
  },
  medicationsWrapper: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // --- Ikon gombok ---
  icon: {
    marginLeft: 8,
    color: "#6B7280",
  },

  // --- Modális ablak ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  modalDeleteContainer: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  modalDeleteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "left",
  },
  modalDeleteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalContainer: {
    width: "95%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 0,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    maxHeight: "90%",
    display: "flex",
    flexDirection: "column",
  },
  editMedicationModalContainer: {
    width: "95%",
    maxWidth: 720,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 0,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    maxHeight: "90%",
    display: "flex",
    flexDirection: "column",
  },
  modalContent: {
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight:16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    width: "100%",
    marginBottom: 12,
  },
  sectionHeaderTextInModal: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 12,
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
    gap: 12,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: "#10B981",
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.4,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },

  // --- Emlékeztető rész ---
  reminderGroup: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  reminderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 16,
  },
  dayList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  dayListInline: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "nowrap",
    marginBottom: 12,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  dayButtonSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  dayButtonText: {
    color: "#374151",
    fontWeight: "500",
  },
  dayButtonTextSelected: {
    color: "#fff",
  },
  reminderTimes: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  deleteReminderText: {
    color: "#d32f2f",
    marginTop: 6,
    fontWeight: "500",
  },
  addReminderButton: {
    color: "#10B981",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },

  // --- Listaelemek ---
  medicationTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#111827",
    textAlign: "center",
  },
  medicationListItem: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  medicationListItemSelected: {
    backgroundColor: "#DCFCE7",
  },
  medicationList: {
    maxHeight: 200,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
  },
  noResultsText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 10,
  },
  loadingIndicator: {
    marginVertical: 10,
  },

  // --- Assing Modal ---
  assignModalContainer: {
    width: "95%",
    maxWidth: 720,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 24,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    maxHeight: "90%",
    display: "flex",
    flexDirection: "column",
  },
  assignList: {
    maxHeight: 200,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  assignModalContent: {
    paddingHorizontal: 24,
  },
  assignCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 12,
    width: "100%",
    maxWidth: 680,
    elevation: 1,
  },
  assignCardSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  assignCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  // --- Intake Tab ---

  intakeTabContent: {
    paddingTop: 32,
    paddingHorizontal: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "flex-start",
    flexGrow: 1,
  },
  intakeHeaderText: {
    fontWeight: "700",
    fontSize: 18,
    color: "#111827",
    marginBottom: 16,
  },

  intakeCard: {
    width: "100%",
    maxWidth: 680,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignSelf: "center",
    border: "1px solid #E5E7EB",
    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.06)",
  },

  intakeCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
    textAlign: "center",
  },

  intakeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },

  intakeTime: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    width: 60,
  },

  takenText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    flex: 1,
  },

  notTakenText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    flex: 1,
  },

  intakeButton: {
    backgroundColor: "#10B981",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  intakeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },

  intakeButtonProfile: {
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 12,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
    elevation: 2,
    transitionDuration: "150ms",
  },

  intakeButtonProfileSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  intakeButtonTextProfile: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },

  intakeButtonTextProfileSelected: {
    color: "#fff",
  },
});