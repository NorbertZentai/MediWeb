package hu.project.MediTrack.modules.profilemedication.entity;

import hu.project.MediTrack.modules.profile.entity.Profile;
import hu.project.MediTrack.modules.medication.entity.Medication;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A "profile_medications" táblát leképező entitás,
 * mely összeköti a Profile-t a Medication-nel.
 */
@Entity
@Table(name = "profile_medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileMedication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kapcsolat a Profile-hoz
    @ManyToOne
    @JoinColumn(name = "profile_id")
    private Profile profile;

    // Kapcsolat a Medication-hez
    @ManyToOne
    @JoinColumn(name = "medication_id")
    private Medication medication;

    /**
     * Alapértelmezett: CURRENT_TIMESTAMP
     * Szükség esetén a Java oldalon is beállíthatjuk az alapértéket.
     */
    private LocalDateTime addedOn = LocalDateTime.now();

    @Column(columnDefinition = "text")
    private String dosage;

    @Column(columnDefinition = "text")
    private String notes;
}
