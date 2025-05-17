import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !gender || !dateOfBirth || !address || !phoneNumber) {
      Alert.alert('Hiba', 'Kérlek, töltsd ki az összes kötelező mezőt.');
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
      Alert.alert('Siker', 'Sikeresen regisztráltál.');
      navigate(from, { replace: true });
    } catch (error) {
      Alert.alert('Hiba', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Regisztráció</Text>
        
        {/* Név mező */}
        <TextInput
          style={styles.input}
          placeholder="Név"
          value={name}
          onChangeText={setName}
        />
        
        {/* Email mező */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        {/* Jelszó mező */}
        <TextInput
          style={styles.input}
          placeholder="Jelszó"
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
            <Text style={styles.checkboxLabel}>Férfi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.checkbox, gender === 'female' && styles.checkboxSelected]}
            onPress={() => setGender('female')}
          >
            <Text style={styles.checkboxLabel}>Nő</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.checkbox, gender === 'other' && styles.checkboxSelected]}
            onPress={() => setGender('other')}
          >
            <Text style={styles.checkboxLabel}>Egyéb</Text>
          </TouchableOpacity>
        </View>
        
        {/* Születési dátum mező */}
        <Text style={styles.label}>Születési dátum:</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          type="date"
        />
        
        {/* Cím mező */}
        <TextInput
          style={styles.input}
          placeholder="Cím"
          value={address}
          onChangeText={setAddress}
        />
        
        {/* Telefonszám mező */}
        <TextInput
          style={styles.input}
          placeholder="Telefonszám"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        
        {/* Regisztráció gomb */}
        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Regisztráció</Text>
        </TouchableOpacity>
        
        {/* Link a bejelentkezéshez */}
        <TouchableOpacity onPress={() => navigate('/login')}>
          <Text style={styles.linkText}>Már van fiókod? Jelentkezz be!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkbox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  checkboxSelected: {
    backgroundColor: '#66BB6A',
    borderColor: '#66BB6A',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#2E7D32',
  },
  button: {
    backgroundColor: '#66BB6A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#66BB6A',
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
