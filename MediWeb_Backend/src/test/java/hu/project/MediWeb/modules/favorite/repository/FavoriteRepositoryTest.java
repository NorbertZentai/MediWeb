package hu.project.MediWeb.modules.favorite.repository;

import hu.project.MediWeb.modules.favorite.entity.Favorite;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository tesztek a kedvencek custom lekérdezéseihez ({@code @DataJpaTest} + valódi PostgreSQL).
 * User + Medication + Favorite hármast szúrunk be {@link TestEntityManager}-rel, és a
 * findByUserId / findByUserAndMedication / existsByUserAndMedication queryket ellenőrizzük.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.sql.init.mode=never")
class FavoriteRepositoryTest {

    @Autowired
    private FavoriteRepository favoriteRepository;
    @Autowired
    private TestEntityManager em;

    private User user;
    private Medication medication;

    @BeforeEach
    void seed() {
        user = em.persistFlushFind(User.builder()
                .name("fav-repo-user")
                .email("fav-repo@test.com")
                .password("hashed")
                .role(UserRole.USER)
                .is_active(true)
                .registration_date(LocalDateTime.now())
                .build());

        // A Medication ID nem auto-generált — kézzel adjuk meg
        medication = em.persistFlushFind(Medication.builder()
                .id(999_000_222L)
                .name("Favorite Repo Medication")
                .build());

        em.persistAndFlush(Favorite.builder()
                .user(user)
                .medication(medication)
                .build());
    }

    @Test
    @DisplayName("findByUserId: visszaadja a felhasználó kedvenceit")
    void findByUserId_returnsFavorites() {
        List<Favorite> favorites = favoriteRepository.findByUserId(user.getId());

        assertThat(favorites).hasSize(1);
        assertThat(favorites.get(0).getMedication().getId()).isEqualTo(medication.getId());
    }

    @Test
    @DisplayName("findByUserAndMedication: megtalálja a konkrét user+gyógyszer kedvencet")
    void findByUserAndMedication_returnsFavorite() {
        Optional<Favorite> found = favoriteRepository.findByUserAndMedication(user, medication);

        assertThat(found).isPresent();
        assertThat(found.get().getUser().getId()).isEqualTo(user.getId());
    }

    @Test
    @DisplayName("existsByUserAndMedication: true ha kedvenc, false ha másik gyógyszer")
    void existsByUserAndMedication_reflectsState() {
        Medication other = em.persistFlushFind(Medication.builder()
                .id(999_000_333L)
                .name("Other Medication")
                .build());

        assertThat(favoriteRepository.existsByUserAndMedication(user, medication)).isTrue();
        assertThat(favoriteRepository.existsByUserAndMedication(user, other)).isFalse();
    }
}
