import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { styles } from './LoginScreen.style';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hiba', 'Kérlek, töltsd ki az összes mezőt.');
      return;
    }

    try {
      await login({ email, password });
      Alert.alert('Siker', 'Sikeresen bejelentkeztél.');
      navigate(from, { replace: true });
    } catch (error) {
      Alert.alert('Hiba', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Bejelentkezés</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onSubmitEditing={handleLogin}
        />
        <TextInput
          style={styles.input}
          placeholder="Jelszó"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Bejelentkezés</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate('/register')}>
          <Text style={styles.linkText}>Nincs még fiókod? Regisztrálj!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}