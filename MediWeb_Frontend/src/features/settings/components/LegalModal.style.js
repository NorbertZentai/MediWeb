import { StyleSheet } from "react-native";
import { MIN_TOUCH_TARGET } from "styles/theme";

// Shared styles of TermsModal and PrivacyPolicyModal.
// The dialog is width-capped only when the window is not phone-width.
export const createStyles = (theme, { isMobile } = {}) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.components.modal.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContainer: {
            width: '100%',
            maxWidth: isMobile ? undefined : 600,
            maxHeight: isMobile ? '80%' : '90%',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            overflow: 'hidden',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        closeButton: {
            minWidth: MIN_TOUCH_TARGET,
            minHeight: MIN_TOUCH_TARGET,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
        },
        closeButtonText: {
            fontSize: 20,
            fontWeight: 'bold',
        },
        modalContent: {
            padding: 20,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 15,
            marginBottom: 8,
        },
        paragraph: {
            fontSize: 14,
            lineHeight: 22,
            marginBottom: 10,
        },
        okButton: {
            minWidth: MIN_TOUCH_TARGET,
            minHeight: MIN_TOUCH_TARGET,
            justifyContent: 'center',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20,
        },
        okButtonText: {
            color: theme.colors.white,
            fontWeight: 'bold',
            fontSize: 16,
        },
    });
