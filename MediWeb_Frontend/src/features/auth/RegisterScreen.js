import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from 'contexts/AuthContext';
import { toast } from '../../utils/toast';
import { createStyles } from './RegisterScreen.style';
import Navbar from 'components/Navbar';
import { useTheme } from 'contexts/ThemeContext';

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  const router = useRouter();
  const { redirect } = useLocalSearchParams();
  const from = redirect || "/";
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !gender || !dateOfBirth || !address || !phoneNumber) {
      toast.error('Kérlek, töltsd ki az összes kötelező mezőt!');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        gender,
        date_of_birth: dateOfBirth,
        address,
        phone_number: phoneNumber
      });
      toast.success('Sikeresen regisztráltál!');
      router.replace(from);
    } catch (error) {
      toast.error(error.message || 'Regisztrációs hiba történt!');
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.form}>
          <Text style={styles.title}>Regisztráció</Text>

          {/* Név mező */}
          <TextInput
            style={styles.input}
            placeholder="Név"
            placeholderTextColor={theme.colors.textTertiary}
            value={name}
            onChangeText={setName}
          />

          {/* Email mező */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Jelszó mező */}
          <TextInput
            style={styles.input}
            placeholder="Jelszó"
            placeholderTextColor={theme.colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Nem mező */}
          <Text style={styles.label}>Nem:</Text>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, gender === 'male' && styles.checkboxSelected]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.checkboxLabel, gender === 'male' && styles.checkboxLabelSelected]}>Férfi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkbox, gender === 'female' && styles.checkboxSelected]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.checkboxLabel, gender === 'female' && styles.checkboxLabelSelected]}>Nő</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkbox, gender === 'other' && styles.checkboxSelected]}
              onPress={() => setGender('other')}
            >
              <Text style={[styles.checkboxLabel, gender === 'other' && styles.checkboxLabelSelected]}>Egyéb</Text>
            </TouchableOpacity>
          </View>

          {/* Születési dátum mező */}
          <Text style={styles.label}>Születési dátum:</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textTertiary}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />

          {/* Cím mező */}
          <TextInput
            style={styles.input}
            placeholder="Cím"
            placeholderTextColor={theme.colors.textTertiary}
            value={address}
            onChangeText={setAddress}
          />

          {/* Telefonszám mező */}
          <TextInput
            style={styles.input}
            placeholder="Telefonszám"
            placeholderTextColor={theme.colors.textTertiary}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          {/* Regisztráció gomb */}
          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Regisztráció</Text>
          </TouchableOpacity>

          {/* Link a bejelentkezéshez */}
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Már van fiókod? Jelentkezz be!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}