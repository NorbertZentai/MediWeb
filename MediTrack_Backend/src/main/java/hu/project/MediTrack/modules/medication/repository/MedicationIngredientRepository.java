package hu.project.MediTrack.modules.medication.repository;

import hu.project.MediTrack.modules.medication.entity.MedicationIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationIngredientRepository extends JpaRepository<MedicationIngredient, Integer> {
    // pl. List<MedicationIngredient> findByMedicationId(Integer medicationId);
}
