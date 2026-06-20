package hu.project.MediWeb.modules.favorite.controller;

import hu.project.MediWeb.modules.favorite.repository.FavoriteRepository;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import hu.project.MediWeb.security.JwtUtil;
import hu.project.MediWeb.support.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * CRUD integrációs teszt a kedvencek HTTP-flow-jára (MockMvc + JWT + valódi PostgreSQL).
 * Aktív felhasználót és egy gyógyszert seedelünk, majd végigvisszük a folyamatot:
 * kedvenc hozzáadása (POST) → kedvencek lekérése (GET). Token nélkül 401-et várunk.
 */
class FavoriteControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String EMAIL = "favorite-it@test.com";
    // A Medication ID nem auto-generált (a sync az OGYÉI item-id-t adja), ezért fix teszt-ID-t használunk
    private static final long TEST_MED_ID = 999_000_111L;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MedicationRepository medicationRepository;
    @Autowired
    private FavoriteRepository favoriteRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    private String token;
    private Long medicationId;

    @BeforeEach
    void seedUserAndMedication() {
        // Korábbi futás takarítása (FK miatt előbb a kedvencek)
        userRepository.findByEmail(EMAIL).ifPresent(u -> {
            favoriteRepository.findByUserId(u.getId()).forEach(favoriteRepository::delete);
            userRepository.delete(u);
        });
        medicationRepository.findById(TEST_MED_ID).ifPresent(medicationRepository::delete);

        User user = User.builder()
                .name("favorite-it-user")
                .email(EMAIL)
                .password(passwordEncoder.encode("Secret123!"))
                .role(UserRole.USER)
                .is_active(true)
                .registration_date(LocalDateTime.now())
                .build();
        userRepository.save(user);

        Medication medication = medicationRepository.save(
                Medication.builder().id(TEST_MED_ID).name("Integration Test Medication").build());
        medicationId = medication.getId();

        token = jwtUtil.generateJwtToken(EMAIL);
    }

    @Test
    @DisplayName("Kedvenc hozzáadása (POST) majd lekérése (GET) — végigmegy a CRUD folyamaton")
    void addFavorite_thenListContainsIt() throws Exception {
        // hozzáadás
        mockMvc.perform(post("/api/favorites/{medicationId}", medicationId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medicationId", is(medicationId.intValue())))
                .andExpect(jsonPath("$.medicationName", is("Integration Test Medication")));

        // lekérés — a frissen hozzáadott kedvenc szerepel a listában
        mockMvc.perform(get("/api/favorites")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].medicationId", is(medicationId.intValue())))
                .andExpect(jsonPath("$[0].medicationName", is("Integration Test Medication")));
    }

    @Test
    @DisplayName("GET /api/favorites: token nélkül 401")
    void getFavorites_returns401_withoutToken() throws Exception {
        mockMvc.perform(get("/api/favorites"))
                .andExpect(status().isUnauthorized());
    }
}
