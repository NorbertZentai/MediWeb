import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  periodSwitcher: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  periodButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#4B5563",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  periodButtonLabelActive: {
    color: "#059669",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "column",
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
  },
  complianceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#059669",
    textAlign: "center",
  },
  complianceMeta: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  legendList: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 99,
  },
  legendLabel: {
    fontSize: 13,
    color: "#374151",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
