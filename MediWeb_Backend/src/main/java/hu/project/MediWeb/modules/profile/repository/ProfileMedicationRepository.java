package hu.project.MediWeb.modules.profile.repository;

import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import hu.project.MediWeb.modules.profile.repository.projection.PopularMedicationProjection;

public interface ProfileMedicationRepository extends JpaRepository<ProfileMedication, Long> {
    List<ProfileMedication> findByProfileId(Long profileId);
    Optional<ProfileMedication> findByProfileIdAndMedicationId(Long profileId, Long medicationId);
    void deleteByProfileIdAndMedicationId(Long profileId, Long medicationId);

    List<ProfileMedication> findByProfileIdIn(Collection<Long> profileIds);

    @Query("SELECT pm.medication.id AS medicationId, pm.medication.name AS name, COUNT(pm) AS usageCount " +
           "FROM ProfileMedication pm " +
           "GROUP BY pm.medication.id, pm.medication.name " +
           "ORDER BY COUNT(pm) DESC")
    List<PopularMedicationProjection> findTopMedications(Pageable pageable);
}