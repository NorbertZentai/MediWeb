import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserScreen() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nincs bejelentkezve.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigate('/login')}>
          <Text style={styles.buttonText}>Bejelentkezés</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = user?.registration_date
    ? new Date(user.registration_date).toLocaleDateString('hu-HU')
    : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profil</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Név:</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Szerep:</Text>
          <Text style={styles.value}>{user.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Fiók létrehozva:</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nem:</Text>
          <Text style={styles.value}>{user.gender || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Születési dátum:</Text>
          <Text style={styles.value}>{user.date_of_birth || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cím:</Text>
          <Text style={styles.value}>{user.address || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Telefonszám:</Text>
          <Text style={styles.value}>{user.phone_number || 'N/A'}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            logout();
            navigate('/');
          }}
        >
          <Text style={styles.logoutButtonText}>Kijelentkezés</Text>
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
  card: {
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
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  button: {
    backgroundColor: '#66BB6A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
