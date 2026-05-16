import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from 'contexts/AuthContext';
import { createStyles } from './LoginScreen.style';
import { toast } from 'utils/toast';
import Navbar from 'components/Navbar';
import { useTheme } from 'contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, googleLogin } = useContext(AuthContext);
  const router = useRouter();
  const { redirect } = useLocalSearchParams();
  const from = redirect || "/";
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requires2fa, setRequires2fa] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Kérlek, töltsd ki az összes mezőt.');
      return;
    }

    if (requires2fa && !twoFaCode) {
      toast.error('Kérlek, add meg a kétlépcsős azonosítási kódot.');
      return;
    }

    try {
      const response = await login({ email, password, code: requires2fa ? twoFaCode : undefined });
      
      if (response && response.requires2fa) {
        setRequires2fa(true);
        toast.success('Kérjük, add meg a kétlépcsős azonosítási kódot.');
        return;
      }

      toast.success('Sikeresen bejelentkeztél.');
      router.replace(from);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Hibás bejelentkezés.';
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
      toast.success('Sikeres bejelentkezés Google fiókkal!');
      router.replace(from);
    } catch (error) {
      toast.error(error.message || 'Hiba a Google bejelentkezés során.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>Bejelentkezés</Text>
          <TextInput
            style={styles.input}
            placeholder="Email cím"
            placeholderTextColor={theme.colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={handleLogin}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Jelszó"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={20} 
                color={theme.colors.textTertiary} 
              />
            </TouchableOpacity>
          </View>

          {requires2fa && (
            <TextInput
              style={styles.input}
              placeholder="6 számjegyű hitelesítő kód"
              placeholderTextColor={theme.colors.textTertiary}
              value={twoFaCode}
              onChangeText={setTwoFaCode}
              keyboardType="number-pad"
              maxLength={6}
              onSubmitEditing={handleLogin}
            />
          )}

          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Bejelentkezés</Text>
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
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.googleButtonText}>Belépés Google-lel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Nincs még fiókod? Regisztrálj!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}