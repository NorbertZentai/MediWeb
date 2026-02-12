import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from 'contexts/AuthContext';
import { createStyles } from './LoginScreen.style';
import { toast } from 'utils/toast';
import Navbar from 'components/Navbar';
import { useTheme } from 'contexts/ThemeContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const { redirect } = useLocalSearchParams();
  const from = redirect || "/";
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Kérlek, töltsd ki az összes mezőt.');
      return;
    }

    try {
      await login({ email, password });
      toast.success('Sikeresen bejelentkeztél.');
      router.replace(from);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Hibás bejelentkezés.';
      toast.error(errorMsg);
    }
  };

  return (
    <View style={styles.container}>
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
          <TextInput
            style={styles.input}
            placeholder="Jelszó"
            placeholderTextColor={theme.colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
            secureTextEntry
          />
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Bejelentkezés</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Nincs még fiókod? Regisztrálj!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}