import { StyleSheet, Platform } from 'react-native';

export const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    headerSpace: {
        height: Platform.OS === 'ios' ? 60 : 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textSecondary,
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 22,
    },
    card: {
        backgroundColor: theme.colors.backgroundCard,
        padding: 24,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.medium,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    otpInput: {
        backgroundColor: theme.colors.backgroundInput || theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: Platform.OS === 'web' ? 16 : 14,
        fontSize: 24,
        letterSpacing: 10,
        textAlign: 'center',
        color: theme.colors.textPrimary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    verifyButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: 8,
    },
    verifyButtonDisabled: {
        opacity: 0.7,
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: theme.fontSize.md,
        fontWeight: 'bold',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    resendText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
    },
    resendLink: {
        color: theme.colors.primary,
        fontSize: theme.fontSize.sm,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    backButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        padding: 8,
    },
    backText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
        fontWeight: '600',
        marginLeft: 8,
    },
});
