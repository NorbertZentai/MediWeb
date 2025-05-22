package hu.project.MediTrack.modules.profile.service;

import hu.project.MediTrack.modules.medication.entity.Medication;
import hu.project.MediTrack.modules.medication.repository.MedicationRepository;
import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import hu.project.MediTrack.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediTrack.modules.profile.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileMedicationService {

    @Autowired
    private ProfileMedicationRepository profileMedicationRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    public List<ProfileMedication> getMedicationsForProfile(Integer profileId) {
        return profileMedicationRepository.findByProfileId(profileId);
    }

    public ProfileMedication addMedication(Integer profileId, Integer medicationId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Profil nem található: " + profileId));
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Gyógyszer nem található: " + medicationId));

        ProfileMedication pm = ProfileMedication.builder()
                .profile(profile)
                .medication(medication)
                .build();

        return profileMedicationRepository.save(pm);
    }

    public ProfileMedication updateMedication(Integer profileId, Integer medicationId, ProfileMedication updatedData) {
        ProfileMedication existing = profileMedicationRepository.findByProfileIdAndMedicationId(profileId, medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Nincs ilyen gyógyszer hozzárendelve a profilhoz."));

        existing.setNotes(updatedData.getNotes());
        existing.setReminders(updatedData.getReminders());

        return profileMedicationRepository.save(existing);
    }

    public void removeMedication(Integer profileId, Integer medicationId) {
        profileMedicationRepository.deleteByProfileIdAndMedicationId(profileId, medicationId);
    }
}