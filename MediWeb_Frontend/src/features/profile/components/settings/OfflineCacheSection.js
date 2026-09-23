import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'contexts/ThemeContext';
import { getCacheInfo, clearCache } from 'utils/medicationCache';
import { showAlert } from 'utils/dialogs';
import { createStyles } from '../SettingsTab.style';

// 'Offline cache' — parent gates rendering with Platform.OS !== 'web'.
export default function OfflineCacheSection() {
    const { theme, isDark } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
    const [cacheCount, setCacheCount] = useState(0);

    useEffect(() => {
        getCacheInfo().then(({ count }) => setCacheCount(count));
    }, []);

    const handleClearCache = async () => {
        await clearCache();
        setCacheCount(0);
        showAlert('Cache törölve', 'Az offline mentett gyógyszeradatok törölve lettek.');
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Offline cache</Text>
                <Text style={styles.sectionSubtitle}>
                    Megtekintett gyógyszerek elmentve offline olvasáshoz (max. 50 db).
                </Text>
            </View>
            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mentett gyógyszerek</Text>
                <Text style={styles.fieldLabel}>{cacheCount} db</Text>
            </View>
            <TouchableOpacity
                style={[styles.actionButton, cacheCount === 0 && styles.actionButtonDisabled]}
                onPress={handleClearCache}
                disabled={cacheCount === 0}
                accessibilityRole="button"
                accessibilityLabel="Cache törlése"
                accessibilityState={{ disabled: cacheCount === 0 }}
            >
                <Text style={styles.actionButtonText}>Cache törlése</Text>
            </TouchableOpacity>
        </View>
    );
}
