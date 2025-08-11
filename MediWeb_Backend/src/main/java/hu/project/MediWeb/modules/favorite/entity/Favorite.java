package hu.project.MediWeb.modules.favorite.entity;

import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.medication.entity.Medication;
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
    private Long id;

    // Kapcsolat a User táblával
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Kapcsolat a Medication táblával
    @ManyToOne
    @JoinColumn(name = "medication_id")
    private Medication medication;
}