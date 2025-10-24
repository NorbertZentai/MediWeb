import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { toast } from 'react-toastify';
import ProfileCard from './profiles/ProfileCard';
import AddProfileModal from './profiles/AddProfileModal';
import EditProfileModal from './profiles/EditProfileModal';
import MedicationCard from './profiles/MedicationCard';
import EditMedicationModal from './profiles/EditMedicationModal';
import AssignMedicationModal from "./profiles/AssignMedicationModal";
import { getProfilesForUser, getMedicationsForProfile, deleteProfile, removeMedicationFromProfile } from 'features/profile/profile.api';
import { styles } from './ProfilesTab.style';

export default function ProfilesTab() {
  const [profiles, setProfiles] = useState([]);
  const [openProfileIds, setOpenProfileIds] = useState([]);
  const [profileMedications, setProfileMedications] = useState({});
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [medicationToDelete, setMedicationToDelete] = useState(null);
  const [medicationToEdit, setMedicationToEdit] = useState(null);
  const [assignVisible, setAssignVisible] = useState(false);

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
        <Text style={styles.addProfileButtonText}>ÚJ PROFIL</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.profileListWrapper}>
        {profiles.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateEmoji}>👥</Text>
              <Text style={styles.emptyStateTitle}>Még nincs profilod</Text>
              <Text style={styles.emptyStateSubtitle}>
                Adj hozzá egy profilt az ÚJ PROFIL gombbal, hogy követni tudd a gyógyszereket.
              </Text>
            </View>
          </View>
        )}

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
                  <TouchableOpacity onPress={() => setAssignVisible(true)} style={styles.addMedicationButton}>
                    <Text style={styles.addMedicationButtonText}>Gyógyszer hozzáadása</Text>
                  </TouchableOpacity>
                </View>

                <AssignMedicationModal
                  profileId={profile.id}
                  visible={assignVisible}
                  onClose={() => setAssignVisible(false)}
                  onAssigned={(medicationIds) => {
                    console.log("Hozzáadva:", medicationIds);
                  }}
                />

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
            try {
              setProfiles((prev) => [...prev, newProfile]);
              toast.success("Profil sikeresen létrehozva.");
            } catch (err) {
              toast.error("Nem sikerült hozzáadni a profilt.");
            } finally {
              setAddModalVisible(false);
            }
          }}
        />
      )}

      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onProfileUpdated={(updated) => {
            try {
              setProfiles((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
              );
              toast.success("Profil frissítve.");
            } catch {
              toast.error("Nem sikerült frissíteni a profilt.");
            } finally {
              setEditingProfile(null);
            }
          }}
        />
      )}

      {medicationToEdit && (
        <EditMedicationModal
          profileId={activeProfileId}
          medication={{ ...medicationToEdit, itemId: medicationToEdit.medicationId }}
          onClose={() => setMedicationToEdit(null)}
          onUpdated={(updatedMed) => {
            try {
              setProfileMedications((prev) => ({
                ...prev,
                [activeProfileId]: prev[activeProfileId].map((m) =>
                  m.medicationId === updatedMed.medicationId ? updatedMed : m
                ),
              }));
              toast.success("Gyógyszer frissítve.");
            } catch {
              toast.error("Nem sikerült frissíteni a gyógyszert.");
            } finally {
              setMedicationToEdit(null);
            }
          }}
          onDeleted={(deletedId) => {
            try {
              setProfileMedications((prev) => ({
                ...prev,
                [activeProfileId]: prev[activeProfileId].filter(
                  (m) => m.medicationId !== deletedId
                ),
              }));
              toast.success("Gyógyszer törölve.");
            } catch {
              toast.error("Nem sikerült törölni a gyógyszert.");
            } finally {
              setMedicationToEdit(null);
            }
          }}
        />
      )}

      {deletingProfile && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeletingProfile(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalDeleteContainer}>
              <Text style={styles.modalDeleteTitle}>
                Biztosan törölni szeretnéd a(z) "{deletingProfile.name}" profilt?
              </Text>
              <View style={styles.modalDeleteActions}>
                <TouchableOpacity onPress={() => setDeletingProfile(null)}>
                  <Text style={styles.cancelButton}>Mégse</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteProfile}>
                  <Text style={styles.deleteButtonText}>Törlés</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {medicationToDelete && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMedicationToDelete(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalDeleteContainer}>
              <Text style={styles.modalDeleteTitle}>
                Biztosan törölni szeretnéd a(z) "{medicationToDelete.medicationName}" gyógyszert?
              </Text>
              <View style={styles.modalDeleteActions}>
                <TouchableOpacity onPress={() => setMedicationToDelete(null)}>
                  <Text style={styles.cancelButton}>Mégse</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteMedication}>
                  <Text style={styles.deleteButtonText}>Törlés</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}