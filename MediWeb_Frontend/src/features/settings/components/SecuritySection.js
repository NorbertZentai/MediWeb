import React, { useContext, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from 'contexts/AuthContext';
import { useTheme } from 'contexts/ThemeContext';
import { generate2FA, enable2FA, disable2FA } from 'features/profile/profile.api';
import { showAlert } from 'utils/dialogs';
import QRCode from 'react-native-qrcode-svg';
import { createStyles } from '../SettingsScreen.style';

// 'BIZTONSÁG' — two-factor authentication setup, enable and disable.
export default function SecuritySection() {
    const { user, setUser } = useContext(AuthContext);
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

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
        } catch {
            showAlert('Hiba', 'Nem sikerült generálni a 2FA kódot.');
        } finally {
            setIs2faLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        if (!setup2faCode || setup2faCode.length < 6) {
            showAlert('Hiba', 'Add meg a 6 jegyű kódot!');
            return;
        }
        setIs2faLoading(true);
        try {
            await enable2FA(setup2faSecret, setup2faCode);
            setIs2faEnabled(true);
            setSetup2faUri(null);
            setSetup2faSecret(null);
            setSetup2faCode('');
            if (setUser) setUser(prev => ({ ...prev, is2faEnabled: true }));
            showAlert('Siker', 'A kétlépcsős azonosítás sikeresen bekapcsolva.');
        } catch {
            showAlert('Hiba', 'Hibás kód. Próbáld újra.');
        } finally {
            setIs2faLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!setup2faCode || setup2faCode.length < 6) {
            showAlert('Hiba', 'Add meg a 6 jegyű kódot a kikapcsoláshoz!');
            return;
        }
        setIs2faLoading(true);
        try {
            await disable2FA(setup2faCode);
            setIs2faEnabled(false);
            setSetup2faCode('');
            if (setUser) setUser(prev => ({ ...prev, is2faEnabled: false }));
            showAlert('Siker', 'A kétlépcsős azonosítás kikapcsolva.');
        } catch {
            showAlert('Hiba', 'Hibás kód. Próbáld újra.');
        } finally {
            setIs2faLoading(false);
        }
    };

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>BIZTONSÁG</Text>
            <View style={styles.card}>
                <View style={[styles.menuItem, { flexWrap: 'wrap', alignItems: 'flex-start', paddingVertical: 14 }]}>
                    <View style={[styles.menuIconWrapper, is2faEnabled && { backgroundColor: '#D1FAE5' }]}>
                        <FontAwesome5 name="shield-alt" size={18} color={is2faEnabled ? '#059669' : theme.colors.primary} />
                    </View>
                    <View style={styles.flex1}>
                        <Text style={styles.menuLabel}>Kétlépcsős azonosítás (2FA)</Text>
                        <Text style={styles.menuHelper}>
                            {is2faEnabled ? 'Aktív — TOTP hitelesítő alkalmazással' : 'Védd fiókodat Google Authenticatorral'}
                        </Text>

                        {!is2faEnabled && !setup2faUri && (
                            <TouchableOpacity
                                style={[styles.twoFaButton, { backgroundColor: theme.colors.primary, marginTop: 10 }]}
                                onPress={handleGenerate2FA}
                                disabled={is2faLoading}
                                accessibilityRole="button"
                                accessibilityLabel={is2faLoading ? 'Generálás...' : 'Kétlépcsős azonosítás (2FA) bekapcsolása'}
                                accessibilityState={{ disabled: is2faLoading }}
                            >
                                <Text style={[styles.twoFaButtonText, { color: '#fff' }]}>
                                    {is2faLoading ? 'Generálás...' : 'Bekapcsolás'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {setup2faUri && !is2faEnabled && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={[styles.menuHelper, { marginBottom: 8 }]}>
                                    Olvasd be a QR kódot egy TOTP alkalmazással (pl. Google Authenticator):
                                </Text>
                                <View style={{ alignItems: 'flex-start', marginBottom: 8 }}>
                                    <QRCode value={setup2faUri} size={150} />
                                </View>
                                <Text style={[styles.menuHelper, { marginBottom: 6 }]}>
                                    Kézi megadás kódja: <Text style={{ fontWeight: '700' }}>{setup2faSecret}</Text>
                                </Text>
                                <TextInput
                                    style={styles.twoFaInput}
                                    accessibilityLabel="6 jegyű kód"
                                    placeholder="6 jegyű kód"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={setup2faCode}
                                    onChangeText={setSetup2faCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                    <TouchableOpacity
                                        style={[styles.twoFaButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
                                        onPress={handleEnable2FA}
                                        disabled={is2faLoading}
                                        accessibilityRole="button"
                                        accessibilityLabel={is2faLoading ? 'Ellenőrzés...' : 'Megerősítés'}
                                        accessibilityState={{ disabled: is2faLoading }}
                                    >
                                        <Text style={[styles.twoFaButtonText, { color: '#fff' }]}>
                                            {is2faLoading ? 'Ellenőrzés...' : 'Megerősítés'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.twoFaButton, { backgroundColor: theme.colors.border, flex: 1 }]}
                                        onPress={() => { setSetup2faUri(null); setSetup2faCode(''); }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Mégse"
                                    >
                                        <Text style={[styles.twoFaButtonText, { color: theme.colors.textPrimary }]}>Mégse</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {is2faEnabled && (
                            <View style={{ marginTop: 10 }}>
                                <TextInput
                                    style={styles.twoFaInput}
                                    accessibilityLabel="6 jegyű kód a kikapcsoláshoz"
                                    placeholder="6 jegyű kód a kikapcsoláshoz"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={setup2faCode}
                                    onChangeText={setSetup2faCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <TouchableOpacity
                                    style={[styles.twoFaButton, { backgroundColor: theme.colors.error, marginTop: 8 }]}
                                    onPress={handleDisable2FA}
                                    disabled={is2faLoading}
                                    accessibilityRole="button"
                                    accessibilityLabel={is2faLoading ? 'Kikapcsolás...' : '2FA kikapcsolása'}
                                    accessibilityState={{ disabled: is2faLoading }}
                                >
                                    <Text style={[styles.twoFaButtonText, { color: '#fff' }]}>
                                        {is2faLoading ? 'Kikapcsolás...' : '2FA kikapcsolása'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
