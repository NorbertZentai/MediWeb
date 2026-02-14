import React from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTheme } from "contexts/ThemeContext";

export default function PrivacyPolicyModal({ visible, onClose }) {
    const { theme } = useTheme();

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, Platform.OS === 'web' && styles.modalContainerWeb]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Adatvédelmi Tájékoztató</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                        <TouchableOpacity onPress={onClose} style={[styles.okButton, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.okButtonText}>Értettem</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalContainerWeb: {
        maxWidth: 600,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
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
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    okButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
