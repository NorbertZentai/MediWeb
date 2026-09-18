import React, { useContext, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'contexts/ThemeContext';
import { AuthContext } from 'contexts/AuthContext';
import { deleteAccount, exportDataDirect } from 'features/profile/profile.api';
import { showAlert, showConfirm } from 'utils/dialogs';
import { createStyles } from '../SettingsTab.style';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// 'Fiókműveletek' — data export (exportDataDirect) and account deletion
// (deleteAccount), moved out of SettingsTab.js per issue #77. The deletion flow is
// the one issue #84 wired to the real endpoint: it requires password re-entry and
// surfaces the backend's error message instead of swallowing it.
export default function AccountActionsSection() {
    const { theme, isDark } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
    const { logout } = useContext(AuthContext);
    const router = useRouter();
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeletePasswordForm, setShowDeletePasswordForm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const handleDataExport = async () => {
        if (exporting) {
            return;
        }
        setExporting(true);
        try {
            const data = await exportDataDirect();
            const jsonData = JSON.stringify(data, null, 2);

            if (Platform.OS === 'web') {
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mediweb_export_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
                showAlert('Siker', 'Az adatok letöltése megkezdődött.');
            } else {
                const fileUri = FileSystem.documentDirectory + `mediweb_export_${new Date().toISOString().split('T')[0]}.json`;
                await FileSystem.writeAsStringAsync(fileUri, jsonData, { encoding: FileSystem.EncodingType.UTF8 });

                const canShare = await Sharing.isAvailableAsync();
                if (canShare) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'application/json',
                        dialogTitle: 'Saját adatok exportálása',
                    });
                } else {
                    showAlert('Siker', `Az adataid le lettek mentve a következő helyre: ${fileUri}`);
                }
            }
        } catch (error) {
            console.error('Adatexport indítása sikertelen', error);
            showAlert(
                'Hiba történt',
                'Nem sikerült exportálni az adatokat. Próbáld újra később.'
            );
        } finally {
            setExporting(false);
        }
    };

    const performAccountDeletion = async (password) => {
        if (!password) {
            showAlert('Hiba', 'Kérjük, add meg a jelszavad a törléshez!');
            return;
        }
        if (deleting) {
            return;
        }
        setDeleting(true);
        try {
            await deleteAccount(password);
            setShowDeletePasswordForm(false);
            setDeletePassword('');
            showAlert('Fiók törölve', 'A fiókod sikeresen törlésre került.');
            logout();
            router.replace('/');
        } catch (error) {
            console.error('Fiók törlése sikertelen', error);
            showAlert(
                'Hiba történt',
                error.response?.data?.message || 'Nem sikerült törölni a fiókot. Próbáld újra később.'
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleConfirmAccountDeletion = () => performAccountDeletion(deletePassword);

    const handleCancelAccountDeletion = () => {
        setShowDeletePasswordForm(false);
        setDeletePassword('');
    };

    const handleAccountDeletion = () => {
        showConfirm(
            'Fiók törlése',
            'Biztosan törölni szeretnéd a fiókodat? Ezt a műveletet nem lehet visszavonni.',
            {
                confirmText: 'Törlés',
                destructive: true,
                onConfirm: () => {
                    setDeletePassword('');
                    setShowDeletePasswordForm(true);
                },
            }
        );
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Fiókműveletek</Text>
                <Text style={styles.sectionSubtitle}>
                    Itt tudod kikérni az adataidat vagy véglegesen törölni a fiókodat. A törléshez meg kell adnod a jelszavad, és a művelet nem vonható vissza.
                </Text>
            </View>
            <View style={styles.fieldColumn}>
                <TouchableOpacity
                    style={[styles.actionButton, exporting && styles.actionButtonDisabled]}
                    onPress={handleDataExport}
                    disabled={exporting}
                >
                    {exporting ? (
                        <ActivityIndicator color={theme.colors.secondaryDark || theme.colors.primary} />
                    ) : (
                        <Text style={styles.actionButtonText}>Adatok exportálása</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.dangerButton,
                        deleting && styles.actionButtonDisabled,
                    ]}
                    onPress={handleAccountDeletion}
                    disabled={deleting}
                >
                    {deleting ? (
                        <ActivityIndicator color={theme.colors.error} />
                    ) : (
                        <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                            Fiók törlése
                        </Text>
                    )}
                </TouchableOpacity>

                {showDeletePasswordForm && (
                    <View style={{ marginTop: 15 }}>
                        <TextInput
                            testID="account-deletion-password-input"
                            style={styles.textInput}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={deletePassword}
                            onChangeText={setDeletePassword}
                            placeholder="Jelszó"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <TouchableOpacity
                                testID="account-deletion-confirm-button"
                                style={[
                                    styles.actionButton,
                                    styles.dangerButton,
                                    deleting && styles.actionButtonDisabled,
                                ]}
                                onPress={handleConfirmAccountDeletion}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator color={theme.colors.error} />
                                ) : (
                                    <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                                        Törlés megerősítése
                                    </Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleCancelAccountDeletion}
                                disabled={deleting}
                            >
                                <Text style={styles.actionButtonText}>Mégse</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
