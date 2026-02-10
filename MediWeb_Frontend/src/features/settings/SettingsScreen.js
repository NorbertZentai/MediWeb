import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from 'contexts/AuthContext';
import { theme } from 'styles/theme';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useContext(AuthContext);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Kijelentkezés',
            'Biztosan ki szeretnél jelentkezni?',
            [
                { text: 'Mégse', style: 'cancel' },
                {
                    text: 'Kijelentkezés',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Beállítások</Text>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FIÓK</Text>
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => router.push('/profile/account')}
                        >
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="user" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.menuLabel}>Profil adatok</Text>
                            <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <View style={styles.menuItem}>
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="bell" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.menuLabel}>Értesítések</Text>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
                                thumbColor={notifications ? theme.colors.primary : theme.colors.textTertiary}
                            />
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {/* TODO: Navigate to privacy settings */ }}
                        >
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="lock" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.menuLabel}>Adatvédelem</Text>
                            <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* App Settings Section */}
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
                                        style={[styles.themeButton, !darkMode && styles.themeButtonActive]}
                                        onPress={() => setDarkMode(false)}
                                    >
                                        <Text style={[styles.themeButtonText, !darkMode && styles.themeButtonTextActive]}>
                                            Világos
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.themeButton, darkMode && styles.themeButtonActive]}
                                        onPress={() => setDarkMode(true)}
                                    >
                                        <Text style={[styles.themeButtonText, darkMode && styles.themeButtonTextActive]}>
                                            Sötét
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

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NÉVJEGY</Text>
                    <View style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="info-circle" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.menuLabel}>Verzió</Text>
                            <Text style={styles.menuValue}>2.1.0</Text>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {/* TODO: Terms of Service */ }}
                        >
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="file-alt" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.menuLabel}>Felhasználási feltételek</Text>
                            <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {/* TODO: Privacy Policy */ }}
                        >
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="shield-alt" size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.menuLabel}>Adatvédelmi irányelvek</Text>
                            <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <FontAwesome5 name="sign-out-alt" size={18} color={theme.colors.error} />
                    <Text style={styles.logoutText}>Kijelentkezés</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.md,
        paddingTop: Platform.OS === 'ios' ? 70 : 60,
        paddingBottom: 100,
    },
    header: {
        marginBottom: theme.spacing.lg,
    },
    headerTitle: {
        fontSize: theme.fontSize.xxxl - 4,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.fontSize.xs + 1,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm + 4,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
    },
    menuIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.textPrimary,
    },
    menuValue: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.divider,
        marginLeft: 70,
    },
    flex1: {
        flex: 1,
    },
    themeOptions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    themeButton: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.divider,
    },
    themeButtonActive: {
        backgroundColor: theme.colors.primaryMuted,
    },
    themeButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.textSecondary,
    },
    themeButtonTextActive: {
        color: theme.colors.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: theme.colors.favoriteLight,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        fontSize: theme.fontSize.base,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.error,
    },
});
