import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from 'contexts/AuthContext';
import { toast } from '../../utils/toast';
import { createStyles } from './RegisterScreen.style';
import Navbar from 'components/Navbar';
import { useTheme } from 'contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
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
    }
  };

  return (
    <View style={styles.container}>
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
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={styles.eyeIcon}
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
            />

            <Text style={styles.label}>Nem</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentButton, gender === 'male' && styles.segmentButtonActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>Férfi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, gender === 'female' && styles.segmentButtonActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>Nő</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, gender === 'other' && styles.segmentButtonActive]}
                onPress={() => setGender('other')}
              >
                <Text style={[styles.segmentText, gender === 'other' && styles.segmentTextActive]}>Egyéb</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleRegister} style={styles.button}>
              <Text style={styles.buttonText}>Regisztráció</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>Már van fiókod? Jelentkezz be!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}