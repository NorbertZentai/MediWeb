import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
    gap: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 16,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  comingSoonText: {
    fontSize: 13,
    color: "#047857",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  fieldHelper: {
    fontSize: 13,
    color: "#6B7280",
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
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
  },
  pillActive: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  pillLabelActive: {
    color: "#047857",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    color: "#111827",
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
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
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
    fontSize: 12,
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  dangerButton: {
    backgroundColor: "#FDE8E8",
    borderColor: "#FCA5A5",
  },
  dangerButtonText: {
    color: "#B91C1C",
  },
});
