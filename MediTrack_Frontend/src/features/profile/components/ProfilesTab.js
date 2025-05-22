import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
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
  removeMedicationFromProfile
} from 'features/profile/profile.api';
import { styles } from './ProfilesTab.style';

export default function ProfilesTab() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isAssignModalVisible, setAssignModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [medications, setMedications] = useState([]);
  const [medicationToDelete, setMedicationToDelete] = useState(null);
  const [medicationToEdit, setMedicationToEdit] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getProfilesForUser();
        setProfiles(data);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast.error("Nem sikerült betölteni a profilokat.");
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    const fetchMedications = async () => {
      if (!selectedProfileId) return;
      try {
        const data = await getMedicationsForProfile(selectedProfileId);
        setMedications(data);
      } catch (error) {
        console.error("Gyógyszerek lekérése sikertelen:", error);
        toast.error("Nem sikerült betölteni a gyógyszereket.");
      }
    };
    fetchMedications();
  }, [selectedProfileId]);

  const handleProfileSelect = (id) => {
    setSelectedProfileId(id);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
  };

  const handleDeleteProfile = (profile) => {
    setDeletingProfile(profile);
  };

  const confirmDeleteProfile = async () => {
    try {
      await deleteProfile(deletingProfile.id);
      setProfiles((prev) => prev.filter((p) => p.id !== deletingProfile.id));
      toast.success("Profil törölve.");
      setDeletingProfile(null);
      if (selectedProfileId === deletingProfile.id) {
        setSelectedProfileId(null);
        setMedications([]);
      }
    } catch (error) {
      console.error("Törlési hiba:", error);
      toast.error("Nem sikerült törölni a profilt.");
    }
  };

  const confirmDeleteMedication = async () => {
    try {
      await removeMedicationFromProfile(selectedProfileId, medicationToDelete.itemId);
      setMedications((prev) =>
        prev.filter((m) => m.itemId !== medicationToDelete.itemId)
      );
      toast.success("Gyógyszer törölve.");
      setMedicationToDelete(null);
    } catch (e) {
      console.error("Gyógyszer törlése sikertelen:", e);
      toast.error("Nem sikerült törölni a gyógyszert.");
    }
  };

  return (
    <View style={styles.tabContent}>
      <Button title="Új profil létrehozása" onPress={() => setAddModalVisible(true)} />

      {profiles.length === 0 && (
        <Text style={styles.noProfilesText}>
          Nincs még létrehozott profil.
        </Text>
      )}

      <ScrollView>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSelected={selectedProfileId === profile.id}
            onSelect={() => handleProfileSelect(profile.id)}
            onEdit={() => handleEditProfile(profile)}
            onDelete={() => handleDeleteProfile(profile)}
          />
        ))}
      </ScrollView>

      {selectedProfileId && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Gyógyszerek ehhez a profilhoz:</Text>
            <Button title="Hozzáadás" onPress={() => setAssignModalVisible(true)} />
          </View>

          {medications.length === 0 ? (
            <Text style={styles.noMedicationsText}>Nincsenek gyógyszerek.</Text>
          ) : (
            medications.map((med) => (
              <MedicationCard
                key={med.itemId}
                medication={med}
                onReminder={() => {}}
                onEditNote={() => setMedicationToEdit(med)}
                onDelete={() => setMedicationToDelete(med)}
              />
            ))
          )}
        </>
      )}

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

      {isAssignModalVisible && selectedProfileId && (
        <AssignMedicationModal
          profileId={selectedProfileId}
          onClose={() => setAssignModalVisible(false)}
          onAssigned={(newMed) => {
            setMedications((prev) => [...prev, newMed]);
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
          profileId={selectedProfileId}
          medication={medicationToEdit}
          onClose={() => setMedicationToEdit(null)}
          onUpdated={(updatedMed) => {
            setMedications((prev) =>
              prev.map((m) => (m.itemId === updatedMed.itemId ? updatedMed : m))
            );
            toast.success("Gyógyszer frissítve.");
            setMedicationToEdit(null);
          }}
          onDeleted={(deletedItemId) => {
            setMedications((prev) =>
              prev.filter((m) => m.itemId !== deletedItemId)
            );
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
              <Button title="Törlés" onPress={confirmDeleteProfile} color="#d32f2f" />
            </View>
          </View>
        </View>
      )}

      {medicationToDelete && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Biztosan törölni szeretnéd a(z) "{medicationToDelete.name}" gyógyszert a profilból?
            </Text>
            <View style={styles.modalActions}>
              <Button title="Mégse" onPress={() => setMedicationToDelete(null)} />
              <Button
                title="Törlés"
                onPress={confirmDeleteMedication}
                color="#d32f2f"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}