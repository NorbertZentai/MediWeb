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
                                <FontAwesome5 name="user" size={18} color="#2E7D32" />
                            </View>
                            <Text style={styles.menuLabel}>Profil adatok</Text>
                            <FontAwesome5 name="chevron-right" size={14} color="#D1D5DB" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <View style={styles.menuItem}>
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="bell" size={18} color="#2E7D32" />
                            </View>
                            <Text style={styles.menuLabel}>Értesítések</Text>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#E2E8F0', true: '#ECFDF5' }}
                                thumbColor={notifications ? '#2E7D32' : '#9CA3AF'}
                            />
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {/* TODO: Navigate to privacy settings */ }}
                        >
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="lock" size={18} color="#2E7D32" />
                            </View>
                            <Text style={styles.menuLabel}>Adatvédelem</Text>
                            <FontAwesome5 name="chevron-right" size={14} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* App Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ALKALMAZÁS</Text>
                    <View style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="palette" size={18} color="#2E7D32" />
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
                                <FontAwesome5 name="globe" size={18} color="#2E7D32" />
                            </View>
                            <Text style={styles.menuLabel}>Nyelv</Text>
                            <Text style={styles.menuValue}>Magyar</Text>
                            <FontAwesome5 name="chevron-right" size={14} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NÉVJEGY</Text>
                    <View style={styles.card}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="info-circle" size={18} color="#2E7D32" />
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
                                <FontAwesome5 name="file-alt" size={18} color="#2E7D32" />
                            </View>
                            <Text style={styles.menuLabel}>Felhasználási feltételek</Text>
                            <FontAwesome5 name="chevron-right" size={14} color="#D1D5DB" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {/* TODO: Privacy Policy */ }}
                        >
                            <View style={styles.menuIconWrapper}>
                                <FontAwesome5 name="shield-alt" size={18} color="#2E7D32" />
                            </View>
                            <Text style={styles.menuLabel}>Adatvédelmi irányelvek</Text>
                            <FontAwesome5 name="chevron-right" size={14} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <FontAwesome5 name="sign-out-alt" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>Kijelentkezés</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 70 : 60, // Extra padding for status bar
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    menuValue: {
        fontSize: 16,
        color: '#64748B',
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 70,
    },
    flex1: {
        flex: 1,
    },
    themeOptions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    themeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    themeButtonActive: {
        backgroundColor: '#ECFDF5',
    },
    themeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    themeButtonTextActive: {
        color: '#2E7D32',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FEF2F2',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
});
