package hu.project.MediTrack.modules.notification.entity;

import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "medication_intake_log", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"profile_medication_id", "intake_date", "intake_time"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationIntakeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "profile_medication_id", nullable = false)
    private ProfileMedication profileMedication;

    @Column(name = "intake_date", nullable = false)
    private LocalDate intakeDate;

    @Column(name = "intake_time", nullable = false)
    private LocalTime intakeTime;

    @Column(name = "taken", nullable = false)
    private boolean taken;
}