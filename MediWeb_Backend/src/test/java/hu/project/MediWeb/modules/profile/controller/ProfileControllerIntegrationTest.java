package hu.project.MediWeb.modules.profile.controller;

import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediWeb.modules.profile.repository.ProfileRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import hu.project.MediWeb.security.JwtUtil;
import hu.project.MediWeb.support.AbstractIntegrationTest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Jogosultsági integrációs teszt a profil- és bevételi végpontokhoz (MockMvc + JWT + valódi PostgreSQL).
 * Két felhasználót seedelünk: a tulajdonos eléri a saját profilját, a másik felhasználó
 * minden ID-alapú végponton 404-et kap, és a profil adatai változatlanok maradnak.
 */
class ProfileControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String OWNER_EMAIL = "profile-owner-it@test.com";
    private static final String STRANGER_EMAIL = "profile-stranger-it@test.com";
    // A Medication ID nem auto-generált, ezért fix teszt-ID-t használunk
    private static final long TEST_MED_ID = 999_000_222L;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProfileRepository profileRepository;
    @Autowired
    private ProfileMedicationRepository profileMedicationRepository;
    @Autowired
    private MedicationRepository medicationRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    private String ownerToken;
    private String strangerToken;
    private Long profileId;
    private Long profileMedicationId;

    @BeforeEach
    void seed() {
        cleanUp();

        User owner = userRepository.save(activeUser("profile-owner", OWNER_EMAIL));
        userRepository.save(activeUser("profile-stranger", STRANGER_EMAIL));

        Profile profile = profileRepository.save(
                Profile.builder().user(owner).name("Nagymama").notes("eredeti").build());
        profileId = profile.getId();

        Medication medication = medicationRepository.save(
                Medication.builder().id(TEST_MED_ID).name("Profile IT Medication").build());
        profileMedicationId = profileMedicationRepository.save(ProfileMedication.builder()
                .profile(profile)
                .medication(medication)
                .notes("")
                .reminders("[]")
                .build()).getId();

        ownerToken = jwtUtil.generateJwtToken(OWNER_EMAIL);
        strangerToken = jwtUtil.generateJwtToken(STRANGER_EMAIL);
    }

    @AfterEach
    void cleanUp() {
        for (String email : new String[]{OWNER_EMAIL, STRANGER_EMAIL}) {
            userRepository.findByEmail(email).ifPresent(u -> {
                profileRepository.findAllByUser(u).forEach(profileRepository::delete);
                userRepository.delete(u);
            });
        }
        medicationRepository.findById(TEST_MED_ID).ifPresent(medicationRepository::delete);
    }

    private User activeUser(String name, String email) {
        return User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode("Secret123!"))
                .role(UserRole.USER)
                .is_active(true)
                .registration_date(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("A tulajdonos lekéri a saját profilját és a mai gyógyszereit")
    void owner_canAccessOwnProfile() throws Exception {
        mockMvc.perform(get("/api/profiles/{id}", profileId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Nagymama")));

        mockMvc.perform(get("/api/intake/today/{profileId}", profileId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Más felhasználó nem olvassa a profilt, a gyógyszereit és a mai bevételeit (404)")
    void stranger_cannotReadForeignProfile() throws Exception {
        mockMvc.perform(get("/api/profiles/{id}", profileId)
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/profiles/{profileId}/medications", profileId)
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/intake/today/{profileId}", profileId)
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Más felhasználó nem módosítja és nem törli a profilt, és bevételt sem rögzít rá (404)")
    void stranger_cannotModifyForeignProfile() throws Exception {
        mockMvc.perform(put("/api/profiles/{id}", profileId)
                        .header("Authorization", "Bearer " + strangerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"feltort\",\"notes\":\"feltort\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/profiles/{id}", profileId)
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/intake")
                        .header("Authorization", "Bearer " + strangerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"profileMedicationId\":" + profileMedicationId + ",\"time\":\"08:00\",\"taken\":true}"))
                .andExpect(status().isNotFound());

        Profile unchanged = profileRepository.findById(profileId).orElseThrow();
        assertThat(unchanged.getName()).isEqualTo("Nagymama");
        assertThat(unchanged.getNotes()).isEqualTo("eredeti");
    }
}
