import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from '../SettingsScreen.style';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsModal from './TermsModal';

// 'NÉVJEGY' — version info plus terms/privacy modal links.
export default function AboutSection() {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [termsModalVisible, setTermsModalVisible] = useState(false);

    return (
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
                    onPress={() => setTermsModalVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Felhasználási feltételek"
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
                    onPress={() => setPrivacyModalVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Adatvédelmi irányelvek"
                >
                    <View style={styles.menuIconWrapper}>
                        <FontAwesome5 name="shield-alt" size={18} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>Adatvédelmi irányelvek</Text>
                    <FontAwesome5 name="chevron-right" size={14} color={theme.colors.borderDark} />
                </TouchableOpacity>
            </View>

            <PrivacyPolicyModal
                visible={privacyModalVisible}
                onClose={() => setPrivacyModalVisible(false)}
            />
            <TermsModal
                visible={termsModalVisible}
                onClose={() => setTermsModalVisible(false)}
            />
        </View>
    );
}
