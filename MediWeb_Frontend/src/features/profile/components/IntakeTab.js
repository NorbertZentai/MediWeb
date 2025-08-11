import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { getProfilesForUser, getTodaysMedications, submitIntake } from "../profile.api";
import { styles } from "./ProfilesTab.style";

export default function IntakeTab() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const data = await getProfilesForUser();
      setProfiles(data);
      if (data.length > 0) {
        setSelectedProfile(data[0]);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (!selectedProfile) return;
    const fetchMeds = async () => {
      const meds = await getTodaysMedications(selectedProfile.id);
      setMedications(meds);
    };
    fetchMeds();
  }, [selectedProfile]);

  const handleIntake = async (profileMedicationId, time, taken) => {
    await submitIntake({ profileMedicationId, time, taken });
    const updated = await getTodaysMedications(selectedProfile.id);
    setMedications(updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.intakeTabContent}>
      <Text style={styles.intakeHeaderText}>Válassz profilt</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            onPress={() => setSelectedProfile(profile)}
            style={[
              styles.intakeButtonProfile,
              selectedProfile?.id === profile.id && styles.intakeButtonProfileSelected,
            ]}
          >
            <Text
              style={[
                styles.intakeButtonTextProfile,
                selectedProfile?.id === profile.id && styles.intakeButtonTextProfileSelected,
              ]}
            >
              {profile.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!selectedProfile && (
        <Text style={styles.noMedicationsText}>Nincs kiválasztott profil.</Text>
      )}

      {selectedProfile && (
        <>
          <Text style={styles.intakeHeaderText}>Mai gyógyszerek</Text>
          {medications.length === 0 && (
            <Text style={styles.noMedicationsText}>Nincs gyógyszer beállítva mára.</Text>
          )}
          {medications.map((med) => (
            <View key={med.profileMedicationId} style={styles.intakeCard}>
              <Text style={styles.intakeCardTitle}>{med.medicationName}</Text>
              {med.times.map((time, idx) => (
                <View key={time} style={styles.intakeRow}>
                  <Text style={styles.intakeTime}>{time}</Text>
                  <Text style={med.takenFlags[idx] ? styles.takenText : styles.notTakenText}>
                    {med.takenFlags[idx] ? "✅ Bevéve" : "❌ Nincs bejelölve"}
                  </Text>
                  {!med.takenFlags[idx] && (
                    <TouchableOpacity
                      onPress={() => handleIntake(med.profileMedicationId, time, true)}
                      style={styles.intakeButton}
                    >
                      <Text style={styles.intakeButtonText}>Bevettem</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}