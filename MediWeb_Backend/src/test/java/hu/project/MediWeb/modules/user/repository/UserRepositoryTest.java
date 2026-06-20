package hu.project.MediWeb.modules.user.repository;

import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository tesztek valódi PostgreSQL ellen ({@code @DataJpaTest} + {@code Replace.NONE}),
 * nem H2-vel. Minden teszt tranzakcióban fut és visszagörgül, így a feltöltött adatbázist
 * nem szennyezi. A teszt-adatot {@link TestEntityManager}-rel szúrjuk be.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.sql.init.mode=never")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TestEntityManager em;

    private User newUser(String name, String email, boolean active) {
        return User.builder()
                .name(name)
                .email(email)
                .password("hashed")
                .role(UserRole.USER)
                .is_active(active)
                .registration_date(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("findByEmail: megtalálja a felhasználót email alapján")
    void findByEmail_returnsUser() {
        em.persistAndFlush(newUser("repo-find-name", "repo-find@test.com", true));

        Optional<User> found = userRepository.findByEmail("repo-find@test.com");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("repo-find-name");
    }

    @Test
    @DisplayName("findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase: kis/nagybetű-független részleges keresés")
    void search_isCaseInsensitiveAndPartial() {
        em.persistAndFlush(newUser("ZxqUniqueName123", "zxq-unique@test.com", true));

        Page<User> page = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                "zxqunique", "zxqunique", PageRequest.of(0, 10));

        assertThat(page.getContent())
                .extracting(User::getName)
                .contains("ZxqUniqueName123");
    }

    @Test
    @DisplayName("countByIsActive (@Query): csak az aktív felhasználókat számolja")
    void countByIsActive_countsOnlyActive() {
        long activeBaseline = userRepository.countByIsActive(true);

        em.persistAndFlush(newUser("count-active-user", "count-active@test.com", true));
        em.persistAndFlush(newUser("count-inactive-user", "count-inactive@test.com", false));

        assertThat(userRepository.countByIsActive(true)).isEqualTo(activeBaseline + 1);
    }
}
