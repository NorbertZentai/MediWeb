import { StyleSheet } from "react-native";

export const createStyles = (theme) => StyleSheet.create({
  // ===== LAYOUT =====
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  contentWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },

  // ===== BACK BUTTON =====
  backButtonRow: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },

  backButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },

  // ===== HEADER =====
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    lineHeight: 38,
  },

  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },

  // ===== INACTIVE BANNER =====
  inactiveBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.favoriteLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },

  inactiveBannerIcon: {
    marginRight: theme.spacing.sm,
  },

  inactiveBannerText: {
    flex: 1,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },

  // ===== FAVORITE BUTTON =====
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.backgroundCard,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },

  favoriteButtonActive: {
    backgroundColor: theme.colors.favoriteLight,
    borderColor: theme.colors.favorite,
  },

  favoriteButtonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },

  favoriteButtonTextActive: {
    color: theme.colors.favorite,
  },

  // ===== PROFILE ROW =====
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },

  profilePickerWrapper: {
    flex: 1,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },

  addButtonText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },

  // ===== IMAGE =====
  imageSection: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },

  mainImage: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundCard,
    ...theme.shadows.md,
  },

  // ===== DOCUMENT ICON ROW =====
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },

  iconButton: {
    alignItems: "center",
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  iconLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: "center",
    fontWeight: theme.fontWeight.medium,
  },

  // ===== ALLERGY SECTION =====
  allergySection: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },

  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  allergyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },

  allergyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },

  allergyBadgeYes: {
    backgroundColor: theme.colors.favoriteLight,
    borderColor: theme.colors.favoriteLight,
  },

  allergyBadgeNo: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.secondaryLight,
  },

  allergyBadgeText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },

  allergyBadgeTextYes: {
    color: theme.colors.error,
  },

  allergyBadgeTextNo: {
    color: theme.colors.success,
  },

  // ===== GRID SECTION (YES/NO INFO) =====
  gridSection: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },

  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },

  gridItemText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },

  gridItemTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },

  // ===== ACCORDION =====
  accordionWrapper: {
    marginBottom: theme.spacing.sm,
  },

  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },

  accordionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },

  accordionBody: {
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.spacing.md,
    marginTop: 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // ===== DETAIL ROW (inside Accordion) =====
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
  },

  detailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.semibold,
    flex: 1,
    textAlign: "right",
  },

  // ===== SUBSTITUTE LINKS =====
  substituteLink: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  substituteLinkText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },

  // ===== PACKAGE / GENERIC LIST ITEMS =====
  packageItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  packageText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  // ===== LEAFLET HEADING =====
  leafletHeading: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },

  // ===== ERROR =====
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    fontSize: theme.fontSize.base,
    marginTop: theme.spacing.xl,
    fontWeight: theme.fontWeight.medium,
  },
});
