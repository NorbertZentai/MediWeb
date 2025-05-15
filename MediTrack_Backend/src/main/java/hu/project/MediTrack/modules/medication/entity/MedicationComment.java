package hu.project.MediTrack.modules.medication.entity;

import hu.project.MediTrack.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medication_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kapcsolat a Medication-höz
    @ManyToOne
    @JoinColumn(name = "medication_id", nullable = true)
    private Medication medication;

    // Kapcsolat a User-höz (ha a user modul elérhető)
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(columnDefinition = "text", nullable = false)
    private String comment;

    private LocalDateTime date = LocalDateTime.now();
}
