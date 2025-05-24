import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { styles } from './LoginScreen.style';
import { toast } from 'react-toastify';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

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
      navigate(from, { replace: true });
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Hibás bejelentkezés.';
      toast.error(errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bejelentkezés</Text>
        <TextInput
          style={styles.input}
          placeholder="Felhasználónév"
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