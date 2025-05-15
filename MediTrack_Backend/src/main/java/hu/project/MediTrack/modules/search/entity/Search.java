package hu.project.MediTrack.modules.search.entity;

import hu.project.MediTrack.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A "searches" táblához tartozó entitás, amely
 * a felhasználó kereséseit rögzíti (kulcsszó, dátum, stb.).
 */
@Entity
@Table(name = "searches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Search {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kapcsolat a User-hez (user_id)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200)
    private String keyword;

    /**
     * Alapértelmezésben az aktuális dátum/idővel inicializáljuk.
     * Ha az adatbázis oldalon is be van állítva a DEFAULT CURRENT_TIMESTAMP,
     * akkor az is működik függetlenül.
     */
    private LocalDateTime searchDate = LocalDateTime.now();
}
