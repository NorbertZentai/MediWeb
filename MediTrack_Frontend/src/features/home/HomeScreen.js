import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { styles} from './HomeScreen.style';

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