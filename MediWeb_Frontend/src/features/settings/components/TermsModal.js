import React, { useMemo } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "contexts/ThemeContext";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";
import { createStyles } from "./LegalModal.style";

export default function TermsModal({ visible, onClose }) {
    const { theme } = useTheme();
    const { isMobile } = useResponsiveLayout();
    const styles = useMemo(() => createStyles(theme, { isMobile }), [theme, isMobile]);

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View testID="terms-modal-overlay" style={styles.modalOverlay}>
                <View testID="terms-modal-container" style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Felhasználási Feltételek</Text>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Bezárás" onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>1. Szolgáltatás leírása</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            A MediWeb egy gyógyszer emlékeztető alkalmazás, amely segít a felhasználóknak a gyógyszerszedés követésében.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>2. Felelősségvállalás</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            Az alkalmazás által nyújtott információk nem helyettesítik a szakorvosi tanácsadást. A fejlesztők nem vállalnak felelősséget az alkalmazás használatából eredő esetleges egészségügyi problémákért. Mindig konzultálj orvosoddal!
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>3. Regisztráció és fiók</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            A felhasználó felelős a fiókadatainak biztonságáért. Fenntartjuk a jogot a fiók felfüggesztésére, ha visszaélést tapasztalunk.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>4. Változtatások joga</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            A szolgáltatási feltételek bármikor módosulhatnak. A jelentős változásokról értesítést küldünk.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>5. Kapcsolat</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            Kérdés vagy probléma esetén írj nekünk a support@mediweb.com címre.
                        </Text>

                        <View style={{ height: 20 }} />
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Elfogadom" onPress={onClose} style={[styles.okButton, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.okButtonText}>Elfogadom</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
