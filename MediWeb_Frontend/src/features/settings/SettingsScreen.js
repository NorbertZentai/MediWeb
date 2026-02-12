import React, { useState, useContext, useMemo, useEffect } from 'react';
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
import { useTheme } from 'contexts/ThemeContext';
import { fetchUserPreferences, updateUserPreferences } from 'features/profile/profile.api';
import { registerForPushNotificationsAsync, getPushPermissionStatus } from 'utils/notifications';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useContext(AuthContext);
    const { theme, themeMode, setThemeMode } = useTheme();
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [preferences, setPreferences] = useState(null);

    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        const loadPrefs = async () => {
            try {
                const prefs = await fetchUserPreferences();
                setPreferences(prefs);
                setEmailEnabled(prefs?.notifications?.medicationReminders ?? true);
                setPushEnabled(prefs?.notifications?.pushEnabled ?? true);
            } catch (e) {
                console.log('Failed to load notification preferences:', e);
            }
        };
        loadPrefs();
    }, []);

    const handleEmailToggle = async (value) => {
        setEmailEnabled(value);
        try {
            const updated = {
                ...preferences,
                notifications: { ...preferences?.notifications, medicationReminders: value },
            };
            await updateUserPreferences(updated);
            setPreferences(updated);
        } catch (e) {
            setEmailEnabled(!value);
            console.log('Failed to update email preference:', e);
        }
    };

    const handlePushToggle = async (value) => {
        if (value && Platform.OS !== 'web') {
            const status = await getPushPermissionStatus();
            if (status !== 'granted') {
                const token = await registerForPushNotificationsAsync();
                if (!token) {
                    Alert.alert(
                        'Engedély szükséges',
                        'A push értesítésekhez engedélyezned kell az értesítéseket a telefon beállításaiban.'
                    );
                    return;
                }
            }
        }
        setPushEnabled(value);
        try {
            const updated = {
                ...preferences,
                notifications: { ...preferences?.notifications, pushEnabled: value },
            };
            await updateUserPreferences(updated);
            setPreferences(updated);
        } catch (e) {
            setPushEnabled(!value);
            console.log('Failed to update push preference:', e);
        }
    };

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
                                <FontAwesome5 name="envelope" size={18} color={theme.colors.primary} />
                            </View>
                            <View style={styles.flex1}>
                                <Text style={styles.menuLabel}>Email értesítések</Text>
                                <Text style={styles.menuHelper}>Gyógyszer emlékeztetők emailben</Text>
                            </View>
                            <Switch
                                value={emailEnabled}
                                onValueChange={handleEmailToggle}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
                                thumbColor={emailEnabled ? theme.colors.primary : theme.colors.textTertiary}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.menuItem}>
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="mobile-alt" size={18} color={theme.colors.primary} />
                            </View>
                            <View style={styles.flex1}>
                                <Text style={styles.menuLabel}>Push értesítések</Text>
                                <Text style={styles.menuHelper}>
                                    {Platform.OS === 'web'
                                        ? 'Csak mobilon elérhető'
                                        : 'Azonnali értesítések a telefonodra'}
                                </Text>
                            </View>
                            <Switch
                                value={pushEnabled}
                                onValueChange={handlePushToggle}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
                                thumbColor={pushEnabled ? theme.colors.primary : theme.colors.textTertiary}
                                disabled={Platform.OS === 'web'}
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

const createStyles = (theme) => StyleSheet.create({
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
    menuHelper: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: 2,
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
        flexWrap: 'wrap',
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
