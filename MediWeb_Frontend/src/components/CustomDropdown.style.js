import { StyleSheet, Dimensions, Platform } from "react-native";

export const createStyles = (theme) => StyleSheet.create({
    container: {
        // no fixed width — controlled by parent
    },

    // Trigger button
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 14,
        minHeight: 52,
        ...theme.shadows.sm,
    },
    triggerOpen: {
        borderColor: theme.colors.primary,
    },
    triggerDisabled: {
        backgroundColor: theme.colors.backgroundElevated,
        borderColor: theme.colors.border,
    },
    triggerText: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.textPrimary,
        fontWeight: theme.fontWeight.medium,
        marginRight: theme.spacing.sm,
    },
    triggerPlaceholder: {
        color: theme.colors.textTertiary,
        fontWeight: theme.fontWeight.normal,
    },
    triggerTextDisabled: {
        color: theme.colors.textTertiary,
    },

    // Modal overlay
    overlay: {
        flex: 1,
        backgroundColor: theme.components?.modal?.overlay || "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },

    // Dropdown card (bottom sheet style)
    dropdownCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        paddingTop: theme.spacing.sm,
        paddingBottom: Platform.OS === "ios" ? 34 : theme.spacing.md,
        maxHeight: Dimensions.get("window").height * 0.5,
        ...theme.shadows.lg,
    },
    dropdownHandle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: theme.spacing.sm,
    },

    list: {
        paddingHorizontal: theme.spacing.md,
    },

    // Option items
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
    },
    optionSelected: {
        backgroundColor: theme.colors.primaryLight || theme.colors.primaryMuted,
    },
    optionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    optionText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textPrimary,
        fontWeight: theme.fontWeight.normal,
        flex: 1,
    },
    optionTextSelected: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },

    // Web-specific dropdown menu (positioned below trigger)
    webDropdownMenu: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        maxHeight: 300,
        overflow: "hidden",
        zIndex: 1000,
        ...theme.shadows.lg,
    },

    // Web-specific option items
    webOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: theme.spacing.md,
    },
});
