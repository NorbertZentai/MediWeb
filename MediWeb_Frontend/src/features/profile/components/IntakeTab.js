import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getProfilesForUser, getTodaysMedications, submitIntake } from "features/profile/profile.api";
import { createStyles } from "./ProfilesTab.style";
import { useTheme } from "contexts/ThemeContext";
import TimePickerModal from "components/ui/TimePickerModal";

export default function IntakeTab() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profileId, profileName } = useLocalSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [medications, setMedications] = useState([]);

  // Missed medications state
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [activeMissed, setActiveMissed] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState({});

  // Calculate missed medications
  const missedMedications = useMemo(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const result = [];

    for (const med of medications) {
      if (!med.times || !med.takenFlags) continue;

      med.times.forEach((time, idx) => {
        if (med.takenFlags[idx] === false && time < currentTime) {
          result.push({
            profileMedicationId: med.profileMedicationId,
            medicationName: med.medicationName,
            scheduledTime: time,
          });
        }
      });
    }

    return result;
  }, [medications]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getProfilesForUser();
        setProfiles(data);
        const targetId = profileId ? Number(profileId) : null;
        const match = targetId
          ? data.find((p) => p.id === targetId)
          : profileName
            ? data.find((p) => p.name === profileName)
            : null;
        setSelectedProfile(match || data[0] || null);
      } catch (error) {
        console.error("Hiba a profilok betöltésekor:", error.message || error);
      }
    };
    fetchProfiles();
  }, [profileId, profileName]);

  useEffect(() => {
    if (!selectedProfile) return;
    const fetchMeds = async () => {
      try {
        if (!getTodaysMedications) return; // Ha még nincs implementálva
        const meds = await getTodaysMedications(selectedProfile.id);
        setMedications(meds || []);
      } catch (error) {
        console.error("Hiba a mai gyógyszerek betöltésekor:", error.message || error);
      }
    };
    fetchMeds();
  }, [selectedProfile]);

  const handleIntake = async (profileMedicationId, time, taken) => {
    try {
      await submitIntake({ profileMedicationId, time, taken });
      if (selectedProfile && getTodaysMedications) {
        const updated = await getTodaysMedications(selectedProfile.id);
        setMedications(updated || []);
      }
    } catch (error) {
      console.error("Hiba a bevétel rögzítésekor:", error.message || error);
    }
  };

  const handleOpenTimePicker = (profileMedicationId, scheduledTime) => {
    setActiveMissed({ profileMedicationId, scheduledTime });
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (selectedTime) => {
    if (activeMissed) {
      const key = `${activeMissed.profileMedicationId}-${activeMissed.scheduledTime}`;
      setSelectedTimes((prev) => ({ ...prev, [key]: selectedTime }));
    }
    setTimePickerVisible(false);
    setActiveMissed(null);
  };

  const handleMissedSubmit = async (profileMedicationId, scheduledTime) => {
    try {
      await submitIntake({ profileMedicationId, time: scheduledTime, taken: true });

      // Clear selected time for this medication
      const key = `${profileMedicationId}-${scheduledTime}`;
      setSelectedTimes((prev) => {
        const newTimes = { ...prev };
        delete newTimes[key];
        return newTimes;
      });

      // Refresh medications list
      if (selectedProfile && getTodaysMedications) {
        const updated = await getTodaysMedications(selectedProfile.id);
        setMedications(updated || []);
      }
    } catch (error) {
      console.error("Hiba az elmulasztott gyógyszer rögzítésekor:", error.message || error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.intakeTabContent, { flexGrow: 1, justifyContent: 'flex-start' }]}
    >
      {profiles.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateEmoji}>💊</Text>
            <Text style={styles.emptyStateTitle}>Nincsenek még profilok</Text>
            <Text style={styles.emptyStateSubtitle}>
              Hozz létre legalább egy profilt a profilok fülön, hogy rögzíthesd a napi gyógyszerbevételeket.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.intakeHeaderText}>Válassz profilt</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, flexGrow: 0 }}>
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
              {medications.length === 0 ? (
                <Text style={styles.noMedicationsText}>Nincs gyógyszer beállítva mára.</Text>
              ) : (
                medications.map((med) => (
                  <View key={med.profileMedicationId} style={styles.intakeCard}>
                    <Text style={styles.intakeCardTitle}>{med.medicationName}</Text>
                    {med.times && med.times.map((time, idx) => (
                      <View key={time + idx} style={styles.intakeRow}>
                        <Text style={styles.intakeTime}>{time}</Text>
                        <Text style={med.takenFlags && med.takenFlags[idx] ? styles.takenText : styles.notTakenText}>
                          {med.takenFlags && med.takenFlags[idx] ? "✅ Bevéve" : "❌ Nincs bejelölve"}
                        </Text>
                        {(!med.takenFlags || !med.takenFlags[idx]) && (
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
                ))
              )}

              {/* Missed Medications Section */}
              {missedMedications.length > 0 && (
                <>
                  <Text style={styles.missedSectionHeader}>Elmulasztott gyógyszerek</Text>
                  {missedMedications.map((missed) => {
                    const key = `${missed.profileMedicationId}-${missed.scheduledTime}`;
                    const displayTime = selectedTimes[key] || "Időpont";

                    return (
                      <View key={key} style={styles.intakeCard}>
                        <Text style={styles.intakeCardTitle}>{missed.medicationName}</Text>
                        <View style={styles.intakeRow}>
                          <Text style={styles.missedScheduledText}>
                            Tervezett: {missed.scheduledTime}
                          </Text>
                        </View>
                        <View style={styles.intakeRow}>
                          <TouchableOpacity
                            style={styles.missedTimeButton}
                            onPress={() => handleOpenTimePicker(missed.profileMedicationId, missed.scheduledTime)}
                          >
                            <Text style={styles.missedTimeButtonText}>{displayTime}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.missedSubmitButton}
                            onPress={() => handleMissedSubmit(missed.profileMedicationId, missed.scheduledTime)}
                          >
                            <Text style={styles.missedSubmitButtonText}>Rögzítés</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        processedTime={activeMissed?.scheduledTime || null}
        onConfirm={handleTimeConfirm}
        onCancel={() => {
          setTimePickerVisible(false);
          setActiveMissed(null);
        }}
        title="Bevétel időpontja"
      />
    </ScrollView>
  );
}