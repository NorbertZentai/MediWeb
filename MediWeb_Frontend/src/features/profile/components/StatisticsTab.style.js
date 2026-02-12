import { StyleSheet } from "react-native";

export const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 12,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  header: {
    gap: 16,
  },
  titleContainer: {
    gap: 4,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  // Modern Period Tabs
  periodTabsContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  periodTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...theme.shadows.sm,
  },
  periodTabActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.secondary,
  },
  periodTabLabel: {
    fontSize: 15,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  periodTabLabelActive: {
    color: theme.colors.secondaryDark,
  },
  card: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.md,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "column",
    gap: 4,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
  },
  complianceValue: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.secondaryDark,
    textAlign: "center",
  },
  complianceMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    textAlign: "center",
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  legendList: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flexShrink: 1,
    lineHeight: 18,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
