import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Button } from 'react-native';
import { toast } from 'react-toastify';
import ProfileCard from './profiles/ProfileCard';
import AddProfileModal from './profiles/AddProfileModal';
import EditProfileModal from './profiles/EditProfileModal';
import AssignMedicationModal from './profiles/AssignMedicationModal';
import MedicationCard from './profiles/MedicationCard';
import EditMedicationModal from './profiles/EditMedicationModal';
import {
  getProfilesForUser,
  getMedicationsForProfile,
  deleteProfile,
  removeMedicationFromProfile,
} from 'features/profile/profile.api';
import { styles } from './ProfilesTab.style';

export default function ProfilesTab() {
  const [profiles, setProfiles] = useState([]);
  const [openProfileIds, setOpenProfileIds] = useState([]);
  const [profileMedications, setProfileMedications] = useState({});
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isAssignModalVisible, setAssignModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [medicationToDelete, setMedicationToDelete] = useState(null);
  const [medicationToEdit, setMedicationToEdit] = useState(null);

  useEffect(() => {
    getProfilesForUser()
      .then(setProfiles)
      .catch(() => toast.error("Nem sikerült betölteni a profilokat."));
  }, []);

  const toggleProfile = async (profileId) => {
    if (openProfileIds.includes(profileId)) {
      setOpenProfileIds((prev) => prev.filter((id) => id !== profileId));
    } else {
      setOpenProfileIds((prev) => [...prev, profileId]);

      if (!profileMedications[profileId]) {
        try {
          const meds = await getMedicationsForProfile(profileId);
          setProfileMedications((prev) => ({ ...prev, [profileId]: meds }));
        } catch {
          toast.error("Nem sikerült betölteni a gyógyszereket.");
        }
      }
    }
  };

  const confirmDeleteProfile = async () => {
    try {
      await deleteProfile(deletingProfile.id);
      setProfiles((prev) => prev.filter((p) => p.id !== deletingProfile.id));
      setOpenProfileIds((prev) => prev.filter((id) => id !== deletingProfile.id));
      setDeletingProfile(null);
      toast.success("Profil törölve.");
    } catch {
      toast.error("Nem sikerült törölni a profilt.");
    }
  };

  const confirmDeleteMedication = async () => {
    try {
      await removeMedicationFromProfile(activeProfileId, medicationToDelete.medicationId);
      setProfileMedications((prev) => ({
        ...prev,
        [activeProfileId]: prev[activeProfileId].filter(
          (m) => m.medicationId !== medicationToDelete.medicationId
        ),
      }));
      toast.success("Gyógyszer törölve.");
      setMedicationToDelete(null);
    } catch {
      toast.error("Nem sikerült törölni a gyógyszert.");
    }
  };

  return (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.addProfileButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.addProfileButtonText}>+ ÚJ PROFIL</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.profileListWrapper}>
        {profiles.map((profile) => (
          <View key={profile.id} style={{ width: '100%', alignItems: 'center' }}>
            <ProfileCard
              profile={profile}
              isSelected={openProfileIds.includes(profile.id)}
              onSelect={() => toggleProfile(profile.id)}
              onEdit={() => setEditingProfile(profile)}
              onDelete={() => setDeletingProfile(profile)}
            />

            {openProfileIds.includes(profile.id) && (
              <View style={styles.medicationsWrapper}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>Gyógyszerek:</Text>
                  <TouchableOpacity
                    style={styles.addMedicationButton}
                    onPress={() => {
                      setActiveProfileId(profile.id);
                      setAssignModalVisible(true);
                    }}
                  >
                    <Text style={styles.addMedicationButtonText}>➕ Hozzáadás</Text>
                  </TouchableOpacity>
                </View>

                {(profileMedications[profile.id]?.length ?? 0) === 0 ? (
                  <Text style={styles.noMedicationsText}>Nincsenek gyógyszerek.</Text>
                ) : (
                  profileMedications[profile.id].map((med) => (
                    <MedicationCard
                      key={med.medicationId}
                      medication={med}
                      onEditNote={() => {
                        setActiveProfileId(profile.id);
                        setMedicationToEdit(med);
                      }}
                      onDelete={() => {
                        setActiveProfileId(profile.id);
                        setMedicationToDelete(med);
                      }}
                    />
                  ))
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {isAddModalVisible && (
        <AddProfileModal
          onClose={() => setAddModalVisible(false)}
          onProfileCreated={(newProfile) => {
            setProfiles((prev) => [...prev, newProfile]);
            toast.success("Profil sikeresen létrehozva.");
            setAddModalVisible(false);
          }}
        />
      )}

      {isAssignModalVisible && activeProfileId && (
        <AssignMedicationModal
          profileId={activeProfileId}
          onClose={() => setAssignModalVisible(false)}
          onAssigned={(newMed) => {
            setProfileMedications((prev) => ({
              ...prev,
              [activeProfileId]: [...(prev[activeProfileId] ?? []), newMed],
            }));
            toast.success("Gyógyszer hozzárendelve.");
            setAssignModalVisible(false);
          }}
        />
      )}

      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onProfileUpdated={(updated) => {
            setProfiles((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            toast.success("Profil frissítve.");
            setEditingProfile(null);
          }}
        />
      )}

      {medicationToEdit && (
        <EditMedicationModal
          profileId={activeProfileId}
          medication={{ ...medicationToEdit, itemId: medicationToEdit.medicationId }}
          onClose={() => setMedicationToEdit(null)}
          onUpdated={(updatedMed) => {
            setProfileMedications((prev) => ({
              ...prev,
              [activeProfileId]: prev[activeProfileId].map((m) =>
                m.medicationId === updatedMed.medicationId ? updatedMed : m
              ),
            }));
            toast.success("Gyógyszer frissítve.");
            setMedicationToEdit(null);
          }}
          onDeleted={(deletedId) => {
            setProfileMedications((prev) => ({
              ...prev,
              [activeProfileId]: prev[activeProfileId].filter(
                (m) => m.medicationId !== deletedId
              ),
            }));
            toast.success("Gyógyszer törölve.");
            setMedicationToEdit(null);
          }}
        />
      )}

      {deletingProfile && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Biztosan törölni szeretnéd a(z) "{deletingProfile.name}" profilt?
            </Text>
            <View style={styles.modalActions}>
              <Button title="Mégse" onPress={() => setDeletingProfile(null)} />
              <Button title="Törlés" color="#d32f2f" onPress={confirmDeleteProfile} />
            </View>
          </View>
        </View>
      )}

      {medicationToDelete && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Biztosan törölni szeretnéd a(z) "{medicationToDelete.medicationName}" gyógyszert?
            </Text>
            <View style={styles.modalActions}>
              <Button title="Mégse" onPress={() => setMedicationToDelete(null)} />
              <Button title="Törlés" color="#d32f2f" onPress={confirmDeleteMedication} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}