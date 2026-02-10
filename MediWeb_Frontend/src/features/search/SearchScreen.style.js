import { StyleSheet } from "react-native";
import { theme } from "styles/theme";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    width: "100%",
    alignItems: "center",
    paddingBottom: 100,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 1000,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },

  // ===== SEARCH ROW =====
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
    height: "100%",
  },
  clearButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },

  // ===== FILTER BUTTON =====
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.backgroundCard,
  },
  filterBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },

  // ===== ACTIVE FILTER CHIPS =====
  activeFiltersContainer: {
    marginBottom: theme.spacing.md,
  },
  chipScrollContent: {
    paddingVertical: theme.spacing.sm,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.secondaryLight,
  },
  activeChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    marginRight: 6,
  },
  activeChipClose: {
    padding: 4,
  },
  clearAllChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDark,
    borderStyle: "dashed",
  },
  clearAllChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },

  // ===== RESULTS =====
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  viewSwitcher: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: theme.colors.backgroundCard,
    padding: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  viewSwitcherButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewSwitcherButtonActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  resultCount: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: "2%",
    justifyContent: "flex-start",
  },
  gridItem: {
    width: "32%",
    minWidth: 200,
    backgroundColor: theme.colors.backgroundCard,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "flex-start",
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  listItem: {
    width: "100%",
    maxWidth: 1200,
    backgroundColor: theme.colors.backgroundCard,
    padding: 16,
    marginBottom: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: "stretch",
    ...theme.shadows.sm,
  },
  medName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  substance: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  company: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inactiveStatus: {
    color: theme.colors.error,
    fontWeight: theme.fontWeight.semibold,
  },

  // ===== LOAD MORE =====
  loadMoreButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.md,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  loadMoreText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },

  // ===== SKELETON LOADING =====
  skeletonContainer: {
    width: "100%",
    marginTop: 20,
  },
  skeletonCard: {
    backgroundColor: theme.colors.backgroundCard,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonLineShort: {
    width: "60%",
  },

  // ===== EMPTY STATE =====
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textTertiary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primaryMuted,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.secondaryLight,
  },
  clearAllButtonText: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
});
