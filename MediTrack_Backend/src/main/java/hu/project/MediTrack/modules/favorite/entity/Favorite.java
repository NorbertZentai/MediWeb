package hu.project.MediTrack.modules.favorite.entity;

import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.medication.entity.Medication;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kapcsolat a User táblával
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Kapcsolat a Medication táblával
    @ManyToOne
    @JoinColumn(name = "medication_id")
    private Medication medication;
}
