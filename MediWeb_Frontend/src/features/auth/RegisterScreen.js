import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from 'contexts/AuthContext';
import { toast } from '../../utils/toast';
import { createStyles } from './RegisterScreen.style';
import Navbar from 'components/Navbar';
import { useTheme } from 'contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const { register, googleLogin } = useContext(AuthContext);
  const router = useRouter();
  const { redirect } = useLocalSearchParams();
  const from = redirect || "/";
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (emailText) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailText)) {
      return 'Kérjük, adjon meg egy érvényes email címet!';
    }
    return '';
  };

  const handleRegister = async () => {
    setEmailError('');
    setPasswordError('');

    if (!name || !email || !password || !confirmPassword || !gender || !dateOfBirth) {
      toast.error('Kérlek, töltsd ki az összes mezőt!');
      return;
    }

    const emailValidationErr = validateEmail(email);
    if (emailValidationErr) {
      setEmailError(emailValidationErr);
      toast.error(emailValidationErr);
      return;
    }

    if (password !== confirmPassword) {
      const pswErr = 'A megadott jelszavak nem egyeznek!';
      setPasswordError(pswErr);
      toast.error(pswErr);
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        gender,
        date_of_birth: dateOfBirth,
        address: "",
        phone_number: ""
      });
      toast.success('Sikeres regisztráció! Kérjük, erősítsd meg az email címedet.');
      router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
       const errorMsg = error?.response?.data?.message || error.message || 'Regisztrációs hiba történt!';
       toast.error(errorMsg);
       toast.error(errorMsg);
    }
  };

   const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
     clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'PENDING_CLIENT_ID',
     iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
     androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
   });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    } else if (response?.type === 'error') {
      toast.error('Google bejelentkezés megszakítva vagy sikertelen.');
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      await googleLogin(idToken);
      toast.success('Sikeres regisztráció/bejelentkezés Google fiókkal!');
      router.replace(from);
    } catch (error) {
      toast.error(error.message || 'Hiba a Google bejelentkezés során.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          <View style={styles.card}>
            <Text style={styles.title}>Regisztráció</Text>

            {/* Fiókadatok (Account Info) */}
            <Text style={styles.sectionTitle}>Fiókadatok</Text>
            
            <Text style={styles.label}>Név</Text>
            <TextInput
              style={styles.input}
              placeholder="Pl. Kovács János"
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
              accessibilityLabel="Név"
            />

            <Text style={styles.label}>Email cím</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="pelda@email.com"
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email cím"
            />

            <Text style={styles.label}>Jelszó</Text>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Minimum 6 karakter"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                accessibilityLabel="Jelszó"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Jelszó megerősítése</Text>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Kérjük ismételje meg a jelszót"
                placeholderTextColor={theme.colors.textTertiary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showConfirmPassword}
                accessibilityLabel="Jelszó megerősítése"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {/* Személyes adatok (Personal Info) */}
            <Text style={styles.sectionTitle}>Személyes adatok</Text>

            <Text style={styles.label}>Születési dátum</Text>
            <TextInput
              style={styles.input}
              placeholder="ÉÉÉÉ.HH.NN."
              placeholderTextColor={theme.colors.textTertiary}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              accessibilityLabel="Születési dátum"
            />

            <Text style={styles.label}>Nem</Text>
            <View style={styles.segmentedControl} accessible accessibilityRole="radiogroup" accessibilityLabel="Nem">
              <TouchableOpacity
                style={[styles.segmentButton, gender === 'male' && styles.segmentButtonActive]}
                onPress={() => setGender('male')}
                accessibilityRole="radio"
                accessibilityLabel="Férfi"
                accessibilityState={{ checked: gender === 'male' }}
              >
                <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>Férfi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, gender === 'female' && styles.segmentButtonActive]}
                onPress={() => setGender('female')}
                accessibilityRole="radio"
                accessibilityLabel="Nő"
                accessibilityState={{ checked: gender === 'female' }}
              >
                <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>Nő</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, gender === 'other' && styles.segmentButtonActive]}
                onPress={() => setGender('other')}
                accessibilityRole="radio"
                accessibilityLabel="Egyéb"
                accessibilityState={{ checked: gender === 'other' }}
              >
                <Text style={[styles.segmentText, gender === 'other' && styles.segmentTextActive]}>Egyéb</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              style={styles.button}
              accessibilityRole="button"
              accessibilityLabel="Regisztráció"
            >
              <Text style={styles.buttonText}>Regisztráció</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>VAGY</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              disabled={!request}
              onPress={() => promptAsync()}
              accessibilityRole="button"
              accessibilityLabel="Regisztráció Google-lel"
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.googleButtonText}>Regisztráció Google-lel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={styles.linkButton}
              accessibilityRole="link"
              accessibilityLabel="Már van fiókod? Jelentkezz be!"
            >
              <Text style={styles.linkText}>Már van fiókod? Jelentkezz be!</Text>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.guestLink}
                onPress={() => router.replace('/(tabs)')}
                accessibilityRole="link"
                accessibilityLabel="Folytatás bejelentkezés nélkül"
              >
                <Text style={styles.guestLinkText}>Folytatás bejelentkezés nélkül</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}