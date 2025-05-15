package hu.project.MediTrack.modules.profile.entity;

import hu.project.MediTrack.modules.profile.enums.RelationshipType;
import hu.project.MediTrack.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * A "profiles" tábla JPA-leképezése.
 */
@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kapcsolat a User táblával:
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true) // Ha nem kötelező, lehet nullable
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender;

    @Column(columnDefinition = "text")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private RelationshipType relationship = RelationshipType.OTHER;

    @Column(columnDefinition = "text")
    private String healthCondition;

    @Column(length = 20)
    private String emergencyContact;

    @Column(columnDefinition = "text")
    private String address;
}
