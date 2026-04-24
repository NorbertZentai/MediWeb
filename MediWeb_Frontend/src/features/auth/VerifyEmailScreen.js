import React, { useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from './VerifyEmailScreen.style';
import { verifyEmail } from './auth.api';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export const VerifyEmailScreen = () => {
    const { email } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (!code || code.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Hiba',
                text2: 'Kérjük, add meg a 6-jegyű kódot!'
            });
            return;
        }

        setIsLoading(true);
        try {
            await verifyEmail(email, code);
            
            Toast.show({
                type: 'success',
                text1: 'Sikeres azonosítás!',
                text2: 'A fiókod aktiválva lett. Kérjük, jelentkezz be.'
            });
            
            // Navigate back to login
            router.replace('/login');
        } catch (error) {
            console.error('Verification error:', error);
            if (Platform.OS === 'web') {
                window.alert(error.message || 'Hibás kód.');
            } else {
                Alert.alert('Hiba', error.message || 'Hibás kód.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerSpace} />

                <View style={styles.iconContainer}>
                    <Ionicons name="mail-unread-outline" size={40} color={theme.colors.primary} />
                </View>

                <Text style={styles.title}>Email Megerősítése</Text>
                <Text style={styles.subtitle}>
                    Elküldtünk egy 6-jegyű kódot a(z) {email ? `\n${email}` : 'email'} címedre. 
                    Kérjük, írd be az aktiváláshoz!
                </Text>

                <View style={styles.card}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Ellenőrző kód</Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="123456"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={code}
                            onChangeText={(text) => {
                                // Only allow numbers and limit to 6 digits
                                const numeric = text.replace(/[^0-9]/g, '').slice(0, 6);
                                setCode(numeric);
                            }}
                            keyboardType="number-pad"
                            autoComplete="one-time-code"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.verifyButton,
                            (isLoading || code.length < 6) && styles.verifyButtonDisabled
                        ]}
                        onPress={handleVerify}
                        disabled={isLoading || code.length < 6}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.verifyButtonText}>Fiók aktiválása</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.replace('/login')}
                >
                    <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.backText}>Vissza a bejelentkezéshez</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};
