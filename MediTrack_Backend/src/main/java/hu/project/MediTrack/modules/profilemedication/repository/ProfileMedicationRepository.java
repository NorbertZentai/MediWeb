package hu.project.MediTrack.modules.profilemedication.repository;

import hu.project.MediTrack.modules.profilemedication.entity.ProfileMedication;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * A ProfileMedication entitáshoz tartozó repository.
 */
public interface ProfileMedicationRepository extends JpaRepository<ProfileMedication, Integer> {
    // További lekérdezések, pl.
    // List<ProfileMedication> findByProfileId(Integer profileId);
    // List<ProfileMedication> findByMedicationId(Integer medicationId);
}
