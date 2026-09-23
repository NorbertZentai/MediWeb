import React, { useMemo } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from '../SettingsTab.style';
import { PillGroup } from './SettingsRows';

const LANGUAGE_OPTIONS = [{ value: 'hu', label: 'Magyar' }];

const THEME_OPTIONS = [
    { value: 'system', label: 'Rendszer' },
    { value: 'light', label: 'Világos' },
    { value: 'dark', label: 'Sötét' },
];

const TIMEZONE_OPTIONS = [
    { value: 'Europe/Budapest', label: 'Budapest (GMT+1)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
];

// 'Általános beállítások'
export default function GeneralSettingsSection({ preferences, onSelect, onInputChange }) {
    const { theme, isDark } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Általános beállítások</Text>
                <Text style={styles.sectionSubtitle}>
                    Testreszabhatod az app megjelenését és alapvető működését.
                </Text>
            </View>
            <PillGroup
                title="Alkalmazás nyelve"
                helper="A felület fő nyelve."
                options={LANGUAGE_OPTIONS}
                value={preferences.general.language}
                onSelect={(value) => onSelect('general', 'language', value)}
                theme={theme}
                styles={styles}
                infoText="Angol nyelv hamarosan érkezik."
            />
            <PillGroup
                title="Téma mód"
                helper="Válaszd ki a számodra kényelmes megjelenést."
                options={THEME_OPTIONS}
                value={preferences.general.theme}
                onSelect={(value) => onSelect('general', 'theme', value)}
                theme={theme}
                styles={styles}
                disabled={false}
            />
            <PillGroup
                title="Időzóna"
                helper="Az értesítések és összefoglalók időzítéséhez használjuk."
                options={TIMEZONE_OPTIONS}
                value={preferences.general.timezone}
                onSelect={(value) => onSelect('general', 'timezone', value)}
                theme={theme}
                styles={styles}
            />
            <View style={styles.inlineInputs}>
                <View style={styles.inlineInputWrapper}>
                    <Text style={styles.inlineLabel}>Napi összefoglaló ideje</Text>
                    <TextInput
                        style={styles.textInput}
                        value={preferences.general.dailyDigestHour}
                        onChangeText={(text) => onInputChange('general', 'dailyDigestHour', text)}
                        accessibilityLabel="Napi összefoglaló ideje"
                        placeholder="08:00"
                        placeholderTextColor={theme.colors.textTertiary}
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                    />
                    <Text style={styles.fieldHelper}>
                        Melyik időpontban kapj napi összefoglaló értesítést.
                    </Text>
                </View>
            </View>
        </View>
    );
}
