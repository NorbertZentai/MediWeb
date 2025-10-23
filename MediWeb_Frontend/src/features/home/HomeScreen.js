import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { getProfilesForUser, getTodaysMedications, getFavorites, submitIntake } from 'features/profile/profile.api';
import { styles } from './HomeScreen.style';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [todayMedications, setTodayMedications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [nextReminder, setNextReminder] = useState(null);
  const [stats, setStats] = useState({
    medicationsCount: 0,
    todayIntakes: 0,
    completedIntakes: 0,
    favoritesCount: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load profiles
      const profilesData = await getProfilesForUser();
      setProfiles(profilesData);

      // Load favorites
      const favoritesData = await getFavorites();
      setFavorites(favoritesData);

      // Load today's medications for all profiles
      if (profilesData.length > 0) {
        const allMeds = [];
        for (const profile of profilesData) {
          const meds = await getTodaysMedications(profile.id);
          allMeds.push(...meds.map(m => ({ ...m, profileName: profile.name, profileId: profile.id })));
        }
        setTodayMedications(allMeds);

        // Calculate stats
        const totalIntakes = allMeds.reduce((sum, med) => sum + med.times.length, 0);
        const completedIntakes = allMeds.reduce((sum, med) => 
          sum + med.takenFlags.filter(flag => flag).length, 0
        );

        setStats({
          medicationsCount: allMeds.length,
          todayIntakes: totalIntakes,
          completedIntakes: completedIntakes,
          favoritesCount: favoritesData.length,
        });

        // Find next reminder
        findNextReminder(allMeds);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const findNextReminder = (medications) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    let nextMed = null;
    let minDiff = Infinity;

    medications.forEach(med => {
      med.times.forEach((time, idx) => {
        if (!med.takenFlags[idx]) {
          const [hours, minutes] = time.split(':').map(Number);
          const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
          
          let diff = (hours * 60 + minutes) - (currentHours * 60 + currentMinutes);
          if (diff < 0) diff += 24 * 60; // Next day
          
          if (diff < minDiff) {
            minDiff = diff;
            nextMed = { ...med, nextTime: time, nextTimeIndex: idx };
          }
        }
      });
    });

    setNextReminder(nextMed);
  };

  const handleQuickIntake = async (medication, timeIndex) => {
    try {
      await submitIntake({
        profileMedicationId: medication.profileMedicationId,
        time: medication.times[timeIndex],
        taken: true
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error submitting intake:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.welcomeCard}>
          <FontAwesome5 name="pills" size={60} color="#66BB6A" style={styles.welcomeIcon} />
          <Text style={styles.welcomeTitle}>Üdvözöllek a MediWeb-ben!</Text>
          <Text style={styles.welcomeSubtitle}>
            Könnyedén nyomon követheted gyógyszereidet és bevételeidet
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigate('/login')}>
              <FontAwesome5 name="sign-in-alt" size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Bejelentkezés</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigate('/register')}>
              <FontAwesome5 name="user-plus" size={16} color="#66BB6A" />
              <Text style={styles.secondaryButtonText}>Regisztráció</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66BB6A" />
        <Text style={styles.loadingText}>Adatok betöltése...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400).delay(0)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Üdvözöllek,</Text>
          <Text style={styles.userName}>{user.name}!</Text>
        </View>
        <TouchableOpacity onPress={() => navigate('/user')} style={styles.profileButton}>
          <FontAwesome5 name="user-circle" size={40} color="#66BB6A" />
        </TouchableOpacity>
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.statsContainer}>
        <StatCard
          icon="pills"
          label="Mai gyógyszerek"
          value={stats.medicationsCount}
          color="#66BB6A"
        />
        <StatCard
          icon="check-circle"
          label="Bevett ma"
          value={`${stats.completedIntakes}/${stats.todayIntakes}`}
          color="#4CAF50"
        />
        <StatCard
          icon="heart"
          label="Kedvencek"
          value={stats.favoritesCount}
          color="#E91E63"
        />
      </Animated.View>

      {/* Next Reminder */}
      {nextReminder && (
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <FontAwesome5 name="bell" size={24} color="#FF9800" />
            <Text style={styles.reminderTitle}>Következő emlékeztető</Text>
          </View>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderMedName}>{nextReminder.medicationName}</Text>
            <Text style={styles.reminderTime}>
              <FontAwesome5 name="clock" size={14} color="#666" /> {nextReminder.nextTime}
            </Text>
            <Text style={styles.reminderProfile}>Profil: {nextReminder.profileName}</Text>
          </View>
          <TouchableOpacity
            style={styles.quickIntakeButton}
            onPress={() => handleQuickIntake(nextReminder, nextReminder.nextTimeIndex)}
          >
            <FontAwesome5 name="check" size={16} color="#FFFFFF" />
            <Text style={styles.quickIntakeButtonText}>Beveszem most</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)}>
        <Text style={styles.sectionTitle}>Gyors műveletek</Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionButton
            icon="pills"
            label="Gyógyszerek"
            color="#66BB6A"
            onPress={() => navigate('/user')}
          />
          <QuickActionButton
            icon="search"
            label="Keresés"
            color="#2196F3"
            onPress={() => navigate('/search')}
          />
          <QuickActionButton
            icon="heart"
            label="Kedvencek"
            color="#E91E63"
            onPress={() => navigate('/user')}
          />
          <QuickActionButton
            icon="user"
            label="Profil"
            color="#9C27B0"
            onPress={() => navigate('/user')}
          />
        </View>
      </Animated.View>

      {/* Today's Medications */}
      <Animated.View entering={FadeInDown.duration(400).delay(400)}>
        <Text style={styles.sectionTitle}>Mai gyógyszerek</Text>
        {todayMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="calendar-check" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>Nincs gyógyszer beállítva mára</Text>
          </View>
        ) : (
          <View style={styles.medicationsList}>
            {todayMedications.map((med, index) => (
              <MedicationCard
                key={`${med.profileMedicationId}-${index}`}
                medication={med}
                onIntake={handleQuickIntake}
                delay={index * 50}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <FontAwesome5 name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickActionButton({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <FontAwesome5 name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MedicationCard({ medication, onIntake, delay }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <Text style={styles.medicationName}>{medication.medicationName}</Text>
        <Text style={styles.medicationProfile}>{medication.profileName}</Text>
      </View>
      <View style={styles.medicationTimes}>
        {medication.times.map((time, idx) => (
          <View key={idx} style={styles.timeSlot}>
            <FontAwesome5
              name={medication.takenFlags[idx] ? 'check-circle' : 'clock'}
              size={16}
              color={medication.takenFlags[idx] ? '#4CAF50' : '#FF9800'}
            />
            <Text style={[
              styles.timeText,
              medication.takenFlags[idx] && styles.timeTextCompleted
            ]}>
              {time}
            </Text>
            {!medication.takenFlags[idx] && (
              <TouchableOpacity
                style={styles.miniIntakeButton}
                onPress={() => onIntake(medication, idx)}
              >
                <Text style={styles.miniIntakeButtonText}>✓</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}