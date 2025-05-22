package hu.project.MediTrack.modules.profile.service;

import hu.project.MediTrack.modules.medication.entity.Medication;
import hu.project.MediTrack.modules.medication.repository.MedicationRepository;
import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import hu.project.MediTrack.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediTrack.modules.profile.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileMedicationService {

    @Autowired
    private ProfileMedicationRepository profileMedicationRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    public List<ProfileMedication> getMedicationsForProfile(Long profileId) {
        return profileMedicationRepository.findByProfileId(profileId);
    }

    public ProfileMedication addMedication(Long profileId, Long medicationId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Profil nem található: " + profileId));
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Gyógyszer nem található: " + medicationId));

        ProfileMedication pm = ProfileMedication.builder()
                .profile(profile)
                .medication(medication)
                .notes("")
                .reminders("[]")
                .build();

        return profileMedicationRepository.save(pm);
    }

    public ProfileMedication updateMedication(Long profileId, Long medicationId, ProfileMedication updatedData) {
        ProfileMedication existing = profileMedicationRepository.findByProfileIdAndMedicationId(profileId, medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Nincs ilyen gyógyszer hozzárendelve a profilhoz."));

        existing.setNotes(updatedData.getNotes());
        existing.setReminders(updatedData.getReminders());

        return profileMedicationRepository.save(existing);
    }

    public void removeMedication(Long profileId, Long medicationId) {
        profileMedicationRepository.deleteByProfileIdAndMedicationId(profileId, medicationId);
    }
}