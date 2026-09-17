import React, { useContext, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { generate2FA, enable2FA, disable2FA } from 'features/profile/profile.api';
import { showAlert } from 'utils/dialogs';
import QRCode from 'react-native-qrcode-svg';
import { createStyles } from '../SettingsTab.style';

// 'Biztonság (2FA)' — owns its own 2FA state/handlers, kept distinct from
// features/settings/components/SecuritySection.js (different copy, per the
// architecture brief's forbidden list: do not merge the two 2FA UIs).
export default function TwoFactorSection() {
    const { user, setUser } = useContext(AuthContext);
    const { theme, isDark } = useTheme();
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

    const [is2faEnabled, setIs2faEnabled] = useState(user?.is2faEnabled || false);
    const [setup2faUri, setSetup2faUri] = useState(null);
    const [setup2faSecret, setSetup2faSecret] = useState(null);
    const [setup2faCode, setSetup2faCode] = useState('');
    const [is2faLoading, setIs2faLoading] = useState(false);

    const handleGenerate2FA = async () => {
        setIs2faLoading(true);
        try {
            const response = await generate2FA();
            setSetup2faUri(response.uri);
            setSetup2faSecret(response.secret);
        } catch (error) {
            showAlert('Hiba', 'Nem sikerült generálni a 2FA kódot.');
        } finally {
            setIs2faLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        if (!setup2faCode || setup2faCode.length < 6) {
            showAlert('Hiba', 'Kérjük, add meg a 6 számjegyű kódot.');
            return;
        }
        setIs2faLoading(true);
        try {
            const response = await enable2FA(setup2faSecret, setup2faCode);
            setIs2faEnabled(true);
            setSetup2faUri(null);
            setSetup2faSecret(null);
            setSetup2faCode('');
            showAlert('Siker', response.message || 'A 2FA sikeresen bekapcsolva.');

            if (setUser) {
                setUser(prev => ({ ...prev, is2faEnabled: true }));
            }
        } catch (error) {
            showAlert('Hiba', error.response?.data?.message || 'Hibás kód.');
        } finally {
            setIs2faLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!setup2faCode || setup2faCode.length < 6) {
            showAlert('Hiba', 'A kikapcsoláshoz meg kell adnod a jelenlegi 6 számjegyű kódot.');
            return;
        }
        setIs2faLoading(true);
        try {
            const response = await disable2FA(setup2faCode);
            setIs2faEnabled(false);
            setSetup2faCode('');
            showAlert('Siker', response.message || 'A 2FA sikeresen kikapcsolva.');

            if (setUser) {
                setUser(prev => ({ ...prev, is2faEnabled: false }));
            }
        } catch (error) {
            showAlert('Hiba', error.response?.data?.message || 'Hibás kód.');
        } finally {
            setIs2faLoading(false);
        }
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Biztonság (2FA)</Text>
                <Text style={styles.sectionSubtitle}>
                    Védje fiókját kétlépcsős azonosítással (Google Authenticator).
                </Text>
            </View>

            <View style={styles.fieldColumn}>
                {!is2faEnabled && !setup2faUri && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleGenerate2FA}
                        disabled={is2faLoading}
                    >
                        {is2faLoading ? (
                            <ActivityIndicator color={theme.colors.secondaryDark || theme.colors.primary} />
                        ) : (
                            <Text style={styles.actionButtonText}>2FA bekapcsolása</Text>
                        )}
                    </TouchableOpacity>
                )}

                {setup2faUri && !is2faEnabled && (
                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
                        <Text style={{ marginBottom: 10, textAlign: 'center', color: theme.colors.textPrimary }}>
                            Olvasd be a QR kódot a Google Authenticator alkalmazással!
                        </Text>
                        <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 10, marginBottom: 15 }}>
                            <QRCode value={setup2faUri} size={150} />
                        </View>
                        <Text style={{ marginBottom: 10, textAlign: 'center', color: theme.colors.textSecondary }}>
                            Kézi megadás kódja: {setup2faSecret}
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="6 számjegyű kód"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={setup2faCode}
                            onChangeText={setSetup2faCode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: 15, width: '100%' }]}
                            onPress={handleEnable2FA}
                            disabled={is2faLoading}
                        >
                            {is2faLoading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <Text style={styles.actionButtonText}>Megerősítés és bekapcsolás</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ marginTop: 15 }}
                            onPress={() => { setSetup2faUri(null); setSetup2faCode(''); }}
                        >
                            <Text style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}>Mégse</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {is2faEnabled && (
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <Text style={{ marginBottom: 15, color: theme.colors.success, fontWeight: 'bold' }}>
                            <FontAwesome5 name="check-circle" /> A kétlépcsős azonosítás (2FA) aktív.
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Jelenlegi 6 számjegyű kód"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={setup2faCode}
                            onChangeText={setSetup2faCode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <TouchableOpacity
                            style={[styles.actionButton, styles.dangerButton, { marginTop: 15, width: '100%' }]}
                            onPress={handleDisable2FA}
                            disabled={is2faLoading}
                        >
                            {is2faLoading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <Text style={[styles.actionButtonText, styles.dangerButtonText]}>2FA kikapcsolása</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}
