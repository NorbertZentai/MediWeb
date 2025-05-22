package hu.project.MediTrack.modules.profile.repository;

import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ProfileMedicationRepository extends JpaRepository<ProfileMedication, Long> {
    List<ProfileMedication> findByProfileId(Integer profileId);
    Optional<ProfileMedication> findByProfileIdAndMedicationId(Integer profileId, Integer medicationId);
    void deleteByProfileIdAndMedicationId(Integer profileId, Integer medicationId);
}
