import { StyleSheet } from "react-native";

export const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    headerButton: {
        padding: theme.spacing.sm,
        minWidth: 60,
    },
    headerTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
    },
    resetText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.primary,
        textAlign: "right",
    },
    resetTextDisabled: {
        color: theme.colors.textTertiary,
    },

    // Body
    body: {
        flex: 1,
    },
    bodyContent: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
    },

    // Section
    sectionTitle: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textTertiary,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.md,
        marginLeft: theme.spacing.xs,
    },
    sectionCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: "hidden",
        ...theme.shadows.sm,
    },

    // Toggle rows
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: theme.spacing.md,
    },
    toggleRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    toggleIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: theme.colors.backgroundElevated,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    toggleIconActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleLabel: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.textPrimary,
        fontWeight: theme.fontWeight.normal,
    },
    toggleLabelActive: {
        fontWeight: theme.fontWeight.medium,
    },

    // Custom toggle switch
    toggleSwitch: {
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.border,
        justifyContent: "center",
        paddingHorizontal: 2,
    },
    toggleSwitchActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    toggleKnobActive: {
        alignSelf: "flex-end",
    },

    // Input fields
    inputGroup: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    inputGroupLast: {
        borderBottomWidth: 0,
    },
    inputLabel: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        height: 48,
    },

    // Date row
    dateRow: {
        flexDirection: "row",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
    },
    dateField: {
        flex: 1,
    },
    dateTrigger: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.backgroundElevated,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        height: 48,
    },
    dateTriggerActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    dateTriggerText: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.textPrimary,
    },
    dateTriggerPlaceholder: {
        color: theme.colors.textTertiary,
    },

    // Footer
    footer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.backgroundCard,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        ...theme.shadows.lg,
    },
    applyButton: {
        flexDirection: "row",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        ...theme.shadows.md,
    },
    applyButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.bold,
    },
});
