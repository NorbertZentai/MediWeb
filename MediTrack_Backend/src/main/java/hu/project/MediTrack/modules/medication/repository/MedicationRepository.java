package hu.project.MediTrack.modules.medication.repository;

import hu.project.MediTrack.modules.medication.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
}