import React, { useMemo } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "contexts/ThemeContext";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";
import { createStyles } from "./LegalModal.style";

export default function PrivacyPolicyModal({ visible, onClose }) {
    const { theme } = useTheme();
    const { isMobile } = useResponsiveLayout();
    const styles = useMemo(() => createStyles(theme, { isMobile }), [theme, isMobile]);

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View testID="privacy-modal-overlay" style={styles.modalOverlay}>
                <View testID="privacy-modal-container" style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Adatvédelmi Tájékoztató</Text>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Bezárás" onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>1. Bevezetés</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            A MediWeb alkalmazás elkötelezett a felhasználók személyes adatainak védelme iránt. Jelen tájékoztató célja, hogy ismertesse, milyen adatokat gyűjtünk, hogyan használjuk és védjük azokat.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>2. Gyűjtött adatok köre</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            - Regisztrációs adatok (név, email cím)
                            {'\n'}- Egészségügyi profil adatok (gyógyszerek, bevételi időpontok)
                            {'\n'}- Alkalmazás használati statisztikák
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>3. Az adatkezelés célja</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            Az adatokat kizárólag az alkalmazás működésének biztosítására használjuk:
                            {'\n'}- Személyre szabott gyógyszer emlékeztetők küldése
                            {'\n'}- Felhasználói fiók kezelése
                            {'\n'}- Szolgáltatás minőségének javítása
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>4. Adatbiztonság</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            Minden személyes adatot titkosított formában tárolunk, és harmadik félnek nem adjuk át, kivéve ha arra törvényi kötelezettségünk van.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>5. Felhasználói jogok</Text>
                        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                            Jogod van kérni adataid törlését, módosítását vagy hordozását. Ezt a Beállítások menüben vagy az ügyfélszolgálaton keresztül teheted meg.
                        </Text>

                        <View style={{ height: 20 }} />
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Értettem" onPress={onClose} style={[styles.okButton, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.okButtonText}>Értettem</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
