import React, { useContext, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Switch, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { deleteAccount } from 'features/profile/profile.api';
import { showAlert } from 'utils/dialogs';
import { createStyles } from '../SettingsScreen.style';

// 'FIÓK' — account link, email/push notification switches and account deletion.
export default function AccountSection({ emailEnabled, pushEnabled, onEmailToggle, onPushToggle }) {
    const router = useRouter();
    const { logout } = useContext(AuthContext);
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);

    const handleDeleteAccount = () => {
        setDeleteModalVisible(true);
    };

    const confirmDeleteAccount = async () => {
        if (!deletePassword) {
            showAlert('Hiba', 'Kérjük, add meg a jelszavad a törléshez!');
            return;
        }

        try {
            await deleteAccount(deletePassword);
            setDeleteModalVisible(false);
            setDeletePassword('');
            logout();
            router.replace('/');
            showAlert('Fiók törölve', 'A fiókod sikeresen törlésre került.');
        } catch (error) {
            console.error('Account deletion failed:', error);
            const msg = error.response?.data?.message || 'Nem sikerült törölni a fiókot. Kérjük, próbáld újra később.';
            showAlert('Hiba', msg);
        }
    };

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>FIÓK</Text>
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/profile/account')}
                    accessibilityRole="button"
                    accessibilityLabel="Profil adatok"
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
                        onValueChange={onEmailToggle}
                        accessibilityRole="switch"
                        accessibilityLabel="Email értesítések"
                        accessibilityState={{ checked: emailEnabled, disabled: false }}
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
                        onValueChange={onPushToggle}
                        accessibilityRole="switch"
                        accessibilityLabel="Push értesítések"
                        accessibilityState={{ checked: pushEnabled, disabled: Platform.OS === 'web' }}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
                        thumbColor={pushEnabled ? theme.colors.primary : theme.colors.textTertiary}
                        disabled={Platform.OS === 'web'}
                    />
                </View>

                <View style={styles.divider} />

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleDeleteAccount}
                    accessibilityRole="button"
                    accessibilityLabel="Fiók törlése"
                >
                    <View style={[styles.menuIconWrapper, { backgroundColor: theme.colors.errorLight || '#FEE2E2' }]}>
                        <FontAwesome5 name="user-slash" size={16} color={theme.colors.error} />
                    </View>
                    <Text style={[styles.menuLabel, { color: theme.colors.error }]}>Fiók törlése</Text>
                    <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
                </TouchableOpacity>
            </View>

            {/* Delete Account Modal */}
            <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.alertBox}>
                        <Text style={[styles.alertTitle, { color: theme.colors.textPrimary }]}>Fiók törlése</Text>
                        <Text style={[styles.alertMessage, { color: theme.colors.textSecondary }]}>
                            A művelet végleges. A törléshez kérjük, add meg a jelenlegi jelszavadat:
                        </Text>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                accessibilityLabel="Jelenlegi jelszó"
                                placeholder="Jelenlegi jelszó"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                                secureTextEntry={!showDeletePassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setShowDeletePassword(!showDeletePassword)}
                                style={styles.eyeIcon}
                                accessibilityRole="button"
                                accessibilityLabel={showDeletePassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                            >
                                <FontAwesome5
                                    name={showDeletePassword ? 'eye' : 'eye-slash'}
                                    size={16}
                                    color={theme.colors.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.alertButtons}>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mégse" onPress={() => { setDeleteModalVisible(false); setDeletePassword(''); }} style={[styles.alertButton, { backgroundColor: theme.colors.border }]}>
                                <Text style={[styles.alertButtonText, { color: theme.colors.textPrimary }]}>Mégse</Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Végleges törlés" onPress={confirmDeleteAccount} style={[styles.alertButton, { backgroundColor: theme.colors.error }]}>
                                <Text style={[styles.alertButtonText, { color: '#fff' }]}>Végleges törlés</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
