import { StyleSheet } from "react-native";

export const createStyles = (theme) => StyleSheet.create({
    // --- Desktop Navbar ---
    navbar: {
        width: "100%",
        height: 72,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 32,
        backgroundColor: theme.colors.backgroundCard, // Changed from white
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
        zIndex: 1000,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border, // Changed from divider
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logoIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        fontSize: 22,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
        letterSpacing: -0.3,
    },
    logoAccent: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.extrabold,
    },
    menu: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    navLink: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    navLinkText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    activeLink: {
        backgroundColor: theme.colors.primaryMuted,
    },
    activeLinkText: {
        color: theme.colors.primary,
    },
    menuDivider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.border,
        marginHorizontal: 12,
    },
    loginButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    loginButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.primary,
    },
    registerButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        marginLeft: 8,
    },
    registerButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.white,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: theme.colors.errorLight || theme.colors.favoriteLight, // Fallback
    },
    logoutText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.error,
    },

    // --- Mobile Navbar ---
    navbarMobile: {
        width: "100%",
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        backgroundColor: theme.colors.backgroundCard, // Changed from white
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        zIndex: 1000,
    },
    hamburgerButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
    hamburgerLine: {
        width: 22,
        height: 2.5,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    hamburgerLineShort: {
        width: 16,
        alignSelf: "flex-end",
    },
    logoIconWrapperSmall: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },

    // --- Mobile Menu Modal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.components?.modal?.overlay || "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-start",
    },
    mobileMenu: {
        backgroundColor: theme.colors.backgroundCard, // Changed from white
        marginTop: 72,
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 20,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 12,
    },
    mobileMenuHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    mobileMenuLogoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    mobileMenuTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    mobileNavSection: {
        gap: 4,
    },
    mobileNavLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    mobileNavLinkActive: {
        backgroundColor: theme.colors.primaryMuted,
    },
    mobileNavIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    mobileNavIconActive: {
        backgroundColor: theme.colors.primary,
    },
    mobileNavLinkText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    mobileNavLinkTextActive: {
        color: theme.colors.primary,
    },
    mobileDivider: {
        height: 1,
        backgroundColor: theme.colors.divider,
        marginVertical: 16,
    },
    mobileAuthSection: {
        gap: 10,
    },
    mobileLoginButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
    },
    mobileLoginButtonText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.white,
    },
    mobileRegisterButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryMuted,
    },
    mobileRegisterButtonText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.primary,
    },
    mobileLogoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.favoriteLight,
    },
    mobileLogoutButtonText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.error,
    },
});
