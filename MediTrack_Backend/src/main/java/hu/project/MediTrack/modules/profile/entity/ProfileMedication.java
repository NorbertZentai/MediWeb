package hu.project.MediTrack.modules.profile.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import hu.project.MediTrack.modules.medication.entity.Medication;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_medications", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"profile_id", "medication_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileMedication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonBackReference
    private Profile profile;

    @ManyToOne(optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    private String notes;

    @Column(columnDefinition = "jsonb")
    private String reminders;

    private LocalDateTime addedAt = LocalDateTime.now();
}
