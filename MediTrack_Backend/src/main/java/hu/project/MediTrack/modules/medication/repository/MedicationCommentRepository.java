package hu.project.MediTrack.modules.medication.repository;

import hu.project.MediTrack.modules.medication.entity.MedicationComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationCommentRepository extends JpaRepository<MedicationComment, Integer> {
    // pl. List<MedicationComment> findByMedicationId(Integer medicationId);
}
