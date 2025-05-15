import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Üdvözöllek a MediTrack-ben!</Text>
        {user ? (
          <>
            <Text style={styles.text}>Bejelentkezve: <Text style={styles.bold}>{user.name}</Text></Text>
            <TouchableOpacity style={styles.button} onPress={() => navigate('/user')}>
              <Text style={styles.buttonText}>Profil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={() => navigate('/login')}>
              <Text style={styles.buttonText}>Bejelentkezés</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigate('/register')}>
              <Text style={styles.buttonText}>Regisztráció</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    backgroundColor: '#66BB6A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
