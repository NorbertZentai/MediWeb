package hu.project.MediTrack.modules.profile.repository;

import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileMedicationRepository extends JpaRepository<ProfileMedication, Long> {
    List<ProfileMedication> findByProfileId(Long profileId);
    Optional<ProfileMedication> findByProfileIdAndMedicationId(Long profileId, Long medicationId);
    void deleteByProfileIdAndMedicationId(Long profileId, Long medicationId);
}