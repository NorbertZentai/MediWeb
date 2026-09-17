import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from 'contexts/ThemeContext';
// NOTE (pre-existing GDPR defect, verified on origin/ai/demo, see issue #77 risk
// notes): profile.api.js does not export requestAccountDeletion. This call was
// already broken before the split; the refactor must keep it exactly as-is and
// not "fix" it by renaming to deleteAccount or adding the missing export.
import { requestAccountDeletion, exportDataDirect } from 'features/profile/profile.api';
import { showAlert, showConfirm } from 'utils/dialogs';
import { createStyles } from '../SettingsTab.style';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// 'Fiókműveletek' — data export (exportDataDirect) and account deletion
// (requestAccountDeletion), moved verbatim from SettingsTab.js:246-327/698-723
// per Rhea's plan-review MUST (both stay under this heading, not 'Adatkezelés').
export default function AccountActionsSection() {
    const { theme, isDark } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    const performAccountDeletion = async () => {
        if (deleting) {
            return;
        }
        setDeleting(true);
        try {
            await requestAccountDeletion();
            showAlert(
                'Kérés rögzítve',
                'A fiók törlési kérelmét fogadtuk. Ügyfélszolgálatunk felveszi veled a kapcsolatot.'
            );
        } catch (error) {
            console.error('Fiók törlési kérelem sikertelen', error);
            showAlert(
                'Hiba történt',
                'Nem sikerült rögzíteni a törlési kérelmet. Próbáld újra később.'
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleAccountDeletion = () => {
        showConfirm(
            'Fiók törlése',
            'Biztosan törölni szeretnéd a fiókodat? Ezt a műveletet nem lehet visszavonni.',
            {
                confirmText: 'Törlés',
                destructive: true,
                onConfirm: performAccountDeletion,
            }
        );
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Fiókműveletek</Text>
                <Text style={styles.sectionSubtitle}>
                    Itt tudod kikérni az adataidat vagy kérvényezni a fiókod törlését. A műveletek végrehajtása előtt emailben értesítünk.
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
            </View>
        </View>
    );
}
