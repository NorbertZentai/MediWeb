import React from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTheme } from "contexts/ThemeContext";

export default function TermsModal({ visible, onClose }) {
    const { theme } = useTheme();

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, Platform.OS === 'web' && styles.modalContainerWeb]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Felhasználási Feltételek</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                        <TouchableOpacity onPress={onClose} style={[styles.okButton, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.okButtonText}>Elfogadom</Text>
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
