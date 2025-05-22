import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // --- Általános konténer ---
  tabContent: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },

  noProfilesText: {
    color: "#9CA3AF",
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  sectionHeaderText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#111827",
  },

  noMedicationsText: {
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },

  // --- Profilkártya (ProfileCard) ---
  profileCard: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  profileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  profileCardActions: {
    flexDirection: "row",
    gap: 12,
  },
  profileCardDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  profileCard: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  profileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  profileCardActions: {
    flexDirection: "row",
    gap: 12,
  },
  profileCardDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  icon: {
    marginLeft: 8,
    color: "#4B5563",
  },

  // --- Modális ablakok (Add/Edit Modal) ---
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalBox: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    width: "100%",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
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
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 16,
  },
  deleteButtonContainer: {
    marginTop: 20,
  },

  // --- Ikon gombok (pl. szerkesztés, törlés, csengő) ---
  icon: {
    marginLeft: 8,
    color: "#4B5563",
  },

  // --- Napválasztó gombok (EditMedicationModal) ---
  dayButton: {
    padding: 6,
    margin: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  dayButtonSelected: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },

  // --- Emlékeztető blokk (EditMedicationModal) ---
  reminderGroup: {
    marginBottom: 16,
  },
  deleteReminderText: {
    color: "#d32f2f",
    marginTop: 6,
  },
  addReminderButton: {
    color: "#10B981",
    fontWeight: "600",
    marginTop: 6,
  },
  noRemindersText: {
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 10,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  dayList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  deleteButtonContainer: {
    marginTop: 20,
  },

  // --- Gyógyszer neve címként (EditMedicationModal) ---
  medicationTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 10,
    color: "#111827",
  },

  // --- Gyógyszer lista elemek (AssignMedicationModal) ---
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

  // --- Gyógyszerkártya (MedicationCard) ---
  medicationCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  medicationActions: {
    flexDirection: "row",
    gap: 12,
  },
  medicationNote: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
});