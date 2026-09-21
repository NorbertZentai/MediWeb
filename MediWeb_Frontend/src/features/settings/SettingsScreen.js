import React, { useState, useContext, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import ResponsiveContainer from 'components/ui/ResponsiveContainer';
import { fetchUserPreferences, updateUserPreferences } from 'features/profile/profile.api';
import { registerForPushNotificationsAsync, getPushPermissionStatus } from 'utils/notifications';
import { showAlert } from 'utils/dialogs';
import { createStyles } from './SettingsScreen.style';
import AccountSection from './components/AccountSection';
import SecuritySection from './components/SecuritySection';
import AppSection from './components/AppSection';
import AboutSection from './components/AboutSection';
import LogoutModal from './components/LogoutModal';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useContext(AuthContext);
    const { theme } = useTheme();
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [preferences, setPreferences] = useState(null);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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
                    showAlert(
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

    const handleLogout = () => setLogoutModalVisible(true);

    const confirmLogout = () => {
        setLogoutModalVisible(false);
        logout();
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ResponsiveContainer padded={false} style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Beállítások</Text>
                    </View>

                    <AccountSection
                        emailEnabled={emailEnabled}
                        pushEnabled={pushEnabled}
                        onEmailToggle={handleEmailToggle}
                        onPushToggle={handlePushToggle}
                    />

                    <SecuritySection />

                    <AppSection />

                    <AboutSection />

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <FontAwesome5 name="sign-out-alt" size={18} color={theme.colors.error} />
                        <Text style={styles.logoutText}>Kijelentkezés</Text>
                    </TouchableOpacity>
                </ResponsiveContainer>
            </ScrollView>

            <LogoutModal
                visible={logoutModalVisible}
                onCancel={() => setLogoutModalVisible(false)}
                onConfirm={confirmLogout}
            />
        </View>
    );
}
