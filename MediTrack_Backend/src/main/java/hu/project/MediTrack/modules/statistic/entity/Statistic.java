package hu.project.MediTrack.modules.statistic.entity;

import hu.project.MediTrack.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A "statistics" tábla leképezése,
 * felhasználónként különböző számlálókkal és időbélyegekkel.
 */
@Entity
@Table(name = "statistics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Statistic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kapcsolat a User-hez (user_id)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Keresések száma
    private Integer searchCount = 0;

    // Hozzáadott gyógyszerek (vagy bármilyen releváns adat)
    private Integer medicationsAddedCount = 0;

    // Utolsó keresés időpontja
    private LocalDateTime lastSearch;

    // Utolsó gyógyszer hozzáadásának időpontja
    private LocalDateTime lastMedicationAdded;
}
