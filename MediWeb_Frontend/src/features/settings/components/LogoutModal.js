import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from '../SettingsScreen.style';

// Presentational logout confirmation modal, kept separate to stay within
// SettingsScreen's 200-line budget.
export default function LogoutModal({ visible, onCancel, onConfirm }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.modalOverlay}>
                <View style={styles.alertBox}>
                    <Text style={[styles.alertTitle, { color: theme.colors.textPrimary }]}>Kijelentkezés</Text>
                    <Text style={[styles.alertMessage, { color: theme.colors.textSecondary }]}>
                        Biztosan ki szeretnél jelentkezni?
                    </Text>
                    <View style={styles.alertButtons}>
                        <TouchableOpacity onPress={onCancel} style={[styles.alertButton, { backgroundColor: theme.colors.border }]}>
                            <Text style={[styles.alertButtonText, { color: theme.colors.textPrimary }]}>Mégse</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onConfirm} style={[styles.alertButton, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.alertButtonText, { color: '#fff' }]}>Kijelentkezés</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
