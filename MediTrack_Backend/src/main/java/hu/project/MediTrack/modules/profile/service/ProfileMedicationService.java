package hu.project.MediTrack.modules.profile.service;

import hu.project.MediTrack.modules.medication.entity.Medication;
import hu.project.MediTrack.modules.medication.repository.MedicationRepository;
import hu.project.MediTrack.modules.profile.dto.ProfileMedicationDTO;
import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import hu.project.MediTrack.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediTrack.modules.profile.repository.ProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileMedicationService {

    @Autowired
    private ProfileMedicationRepository profileMedicationRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @Transactional
    public List<ProfileMedicationDTO> getMedicationsForProfile(Long profileId) {
        return profileMedicationRepository.findByProfileId(profileId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfileMedicationDTO addMedication(Long profileId, Long medicationId) {
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

        return convertToDTO(profileMedicationRepository.save(pm));
    }

    @Transactional
    public ProfileMedicationDTO updateMedication( Long profileId, Long medicationId, String note, String remindersJson) {
        ProfileMedication existing = profileMedicationRepository.findByProfileIdAndMedicationId( profileId, medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Nincs ilyen gyógyszer hozzárendelve a profilhoz."));

        existing.setNotes(note);
        existing.setReminders(remindersJson);

        return convertToDTO(profileMedicationRepository.save(existing));
    }

    @Transactional
    public void removeMedication(Long profileId, Long medicationId) {
        profileMedicationRepository.deleteByProfileIdAndMedicationId(profileId, medicationId);
    }

    private ProfileMedicationDTO convertToDTO(ProfileMedication pm) {
        return ProfileMedicationDTO.builder()
                .id(pm.getId())
                .profileId(pm.getProfile().getId())
                .medicationId(pm.getMedication().getId())
                .medicationName(pm.getMedication().getName())
                .notes(pm.getNotes())
                .reminders(pm.getReminders())
                .createdAt(pm.getAddedAt())
                .build();
    }
}