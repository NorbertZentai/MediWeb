import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from '../SettingsTab.style';
import { ToggleRow } from './SettingsRows';

// 'Adatkezelés' — per Rhea's plan-review MUST, this section owns only the
// anonymizedAnalytics toggle; data export lives under 'Fiókműveletek'
// (AccountActionsSection) to match the existing heading-to-JSX mapping 1:1.
export default function DataSection({ preferences, onToggle }) {
    const { theme, isDark } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Adatkezelés</Text>
                <Text style={styles.sectionSubtitle}>
                    Szabályozd, hogyan kezeljük és használjuk fel az adataidat.
                </Text>
            </View>
            <ToggleRow
                title="Anonimizált analitikák engedélyezése"
                helper="Segíts nekünk a szolgáltatás fejlesztésében névtelen statisztikák megosztásával."
                value={preferences.data.anonymizedAnalytics}
                onValueChange={onToggle('data', 'anonymizedAnalytics')}
                theme={theme}
                styles={styles}
            />
        </View>
    );
}
