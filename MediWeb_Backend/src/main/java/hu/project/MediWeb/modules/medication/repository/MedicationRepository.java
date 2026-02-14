package hu.project.MediWeb.modules.medication.repository;

import hu.project.MediWeb.modules.medication.entity.Medication;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long>, JpaSpecificationExecutor<Medication> {
	Optional<Medication> findFirstByNameIgnoreCase(String name);

	@Query("select m.id from Medication m")
	List<Long> findAllIds();

	@Query("select m.id from Medication m where m.imageUrl is null or m.imageUrl = ''")
	List<Long> findIdsWithoutImage();

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update Medication m set m.active = false")
	int deactivateAll();

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update Medication m set m.active = false where m.id not in :ids")
	int deactivateMissing(@Param("ids") Collection<Long> ids);

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update Medication m set m.active = true where m.id in :ids")
	int activateExisting(@Param("ids") Collection<Long> ids);

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update Medication m set m.lastReviewedAt = :reviewedAt where m.id in :ids")
	int updateLastReviewedAt(@Param("ids") Collection<Long> ids, @Param("reviewedAt") LocalDateTime reviewedAt);
}