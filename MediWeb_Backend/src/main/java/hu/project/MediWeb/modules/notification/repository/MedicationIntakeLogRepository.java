package hu.project.MediWeb.modules.notification.repository;

import hu.project.MediWeb.modules.notification.entity.MedicationIntakeLog;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

public interface MedicationIntakeLogRepository extends JpaRepository<MedicationIntakeLog, Long> {

    Optional<MedicationIntakeLog> findByProfileMedicationAndIntakeDateAndIntakeTime(
            ProfileMedication profileMedication,
            LocalDate intakeDate,
            LocalTime intakeTime
    );
}