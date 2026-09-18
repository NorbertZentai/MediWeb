import React, { useMemo } from 'react';
import { View, Text, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from '../SettingsTab.style';
import { ToggleRow } from './SettingsRows';

// 'Értesítési beállítások'
export default function NotificationSettingsSection({ preferences, onToggle }) {
    const { theme, isDark } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Értesítési beállítások</Text>
                <Text style={styles.sectionSubtitle}>
                    Állítsd be, hogyan szeretnél értesítéseket kapni a gyógyszereidről és
                    az egészségeddel kapcsolatos teendőkről.
                </Text>
            </View>

            <View style={styles.subsectionHeader}>
                <FontAwesome5 name="envelope" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.subsectionTitle}>Email értesítések</Text>
            </View>
            <ToggleRow
                title="Gyógyszer emlékeztetők"
                helper="Email értesítések a közelgő gyógyszerbevételekről."
                value={preferences.notifications.medicationReminders}
                onValueChange={onToggle('notifications', 'medicationReminders')}
                theme={theme}
                styles={styles}
            />
            <ToggleRow
                title="Heti email összefoglaló"
                helper="Vasárnap délben elküldött összegző email a heti gyógyszerhasználatról."
                value={preferences.notifications.summaryEmails}
                onValueChange={onToggle('notifications', 'summaryEmails')}
                theme={theme}
                styles={styles}
            />
            <ToggleRow
                title="Recept megújítás"
                helper="Értesítés, amikor közeledik egy recept megújításának határideje."
                value={preferences.notifications.refillAlerts}
                onValueChange={onToggle('notifications', 'refillAlerts')}
                theme={theme}
                styles={styles}
            />

            <View style={styles.divider} />

            <View style={styles.subsectionHeader}>
                <FontAwesome5 name="mobile-alt" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.subsectionTitle}>Telefonos push értesítések</Text>
            </View>
            {Platform.OS === 'web' ? (
                <View style={styles.infoBox}>
                    <FontAwesome5 name="info-circle" size={14} color={theme.colors.primary} />
                    <Text style={styles.infoBoxText}>
                        A telefonos push értesítések csak a mobil alkalmazásban érhetők el. Töltsd le az appot, hogy push értesítéseket kapj!
                    </Text>
                </View>
            ) : null}
            <ToggleRow
                title="Push értesítések"
                helper="Azonnali értesítések a telefonodra gyógyszerbevételi emlékeztetőkről."
                value={preferences.notifications.pushEnabled}
                onValueChange={onToggle('notifications', 'pushEnabled')}
                theme={theme}
                styles={styles}
            />
        </View>
    );
}
