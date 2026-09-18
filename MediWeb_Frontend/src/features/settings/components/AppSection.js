import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from '../SettingsScreen.style';

// 'ALKALMAZÁS' — theme mode selection and language row.
export default function AppSection() {
    const { theme, themeMode, setThemeMode } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>ALKALMAZÁS</Text>
            <View style={styles.card}>
                <View style={styles.menuItem}>
                    <View style={styles.menuIconWrapper}>
                        <FontAwesome5 name="palette" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.flex1}>
                        <Text style={styles.menuLabel}>Téma</Text>
                        <View style={styles.themeOptions}>
                            <TouchableOpacity
                                style={[styles.themeButton, themeMode === 'light' && styles.themeButtonActive]}
                                onPress={() => setThemeMode('light')}
                            >
                                <Text style={[styles.themeButtonText, themeMode === 'light' && styles.themeButtonTextActive]}>
                                    Világos
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.themeButton, themeMode === 'dark' && styles.themeButtonActive]}
                                onPress={() => setThemeMode('dark')}
                            >
                                <Text style={[styles.themeButtonText, themeMode === 'dark' && styles.themeButtonTextActive]}>
                                    Sötét
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.themeButton, themeMode === 'system' && styles.themeButtonActive]}
                                onPress={() => setThemeMode('system')}
                            >
                                <Text style={[styles.themeButtonText, themeMode === 'system' && styles.themeButtonTextActive]}>
                                    Rendszer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {/* TODO: Language selection */ }}
                >
                    <View style={styles.menuIconWrapper}>
                        <FontAwesome5 name="globe" size={18} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>Nyelv</Text>
                    <Text style={styles.menuValue}>Magyar</Text>
                    <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
