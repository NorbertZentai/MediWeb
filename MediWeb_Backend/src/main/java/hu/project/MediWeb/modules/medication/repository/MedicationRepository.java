package hu.project.MediWeb.modules.medication.repository;

import hu.project.MediWeb.modules.medication.entity.Medication;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
	Optional<Medication> findFirstByNameIgnoreCase(String name);
}