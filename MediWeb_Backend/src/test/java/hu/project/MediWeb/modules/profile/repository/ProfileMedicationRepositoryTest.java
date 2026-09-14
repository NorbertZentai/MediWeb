package hu.project.MediWeb.modules.profile.repository;

import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository tesztek a {@link ProfileMedicationRepository#findReminderCandidates(String)}
 * időtoken-alapú perc-szűréséhez ({@code @DataJpaTest} + valódi PostgreSQL, a
 * {@code FavoriteRepositoryTest} mintáját követve). User -> Profile -> Medication ->
 * ProfileMedication négyest szúrunk be {@link TestEntityManager}-rel.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.sql.init.mode=never")
class ProfileMedicationRepositoryTest {

    @Autowired
    private ProfileMedicationRepository profileMedicationRepository;
    @Autowired
    private TestEntityManager em;

    private User user;
    private Profile profile;
    private ProfileMedication morningReminder;
    private ProfileMedication eveningReminder;
    private ProfileMedication noReminder;
    private ProfileMedication whitespaceReminder;
    private ProfileMedication nullReminder;

    @BeforeEach
    void seed() {
        user = em.persistFlushFind(User.builder()
                .name("reminder-repo-user")
                .email("reminder-repo@test.com")
                .password("hashed")
                .role(UserRole.USER)
                .is_active(true)
                .registration_date(LocalDateTime.now())
                .build());

        profile = em.persistFlushFind(Profile.builder()
                .user(user)
                .name("Fő profil")
                .build());

        Medication morningMed = em.persistFlushFind(Medication.builder()
                .id(999_100_001L)
                .name("Reggeli gyógyszer")
                .build());
        Medication eveningMed = em.persistFlushFind(Medication.builder()
                .id(999_100_002L)
                .name("Esti gyógyszer")
                .build());
        Medication noReminderMed = em.persistFlushFind(Medication.builder()
                .id(999_100_003L)
                .name("Emlékeztető nélküli gyógyszer")
                .build());
        Medication whitespaceMed = em.persistFlushFind(Medication.builder()
                .id(999_100_004L)
                .name("Extra szóközös gyógyszer")
                .build());
        Medication nullMed = em.persistFlushFind(Medication.builder()
                .id(999_100_005L)
                .name("NULL emlékeztetős gyógyszer")
                .build());

        morningReminder = em.persistFlushFind(ProfileMedication.builder()
                .profile(profile)
                .medication(morningMed)
                .reminders("[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]")
                .build());

        eveningReminder = em.persistFlushFind(ProfileMedication.builder()
                .profile(profile)
                .medication(eveningMed)
                .reminders("[{\"days\":[\"H\"],\"times\":[\"18:00\"]}]")
                .build());

        noReminder = em.persistFlushFind(ProfileMedication.builder()
                .profile(profile)
                .medication(noReminderMed)
                .reminders("[]")
                .build());

        whitespaceReminder = em.persistFlushFind(ProfileMedication.builder()
                .profile(profile)
                .medication(whitespaceMed)
                .reminders("[{\"days\": [\"H\"], \"times\": [ \"08:00\" ]}]")
                .build());

        nullReminder = em.persistFlushFind(ProfileMedication.builder()
                .profile(profile)
                .medication(nullMed)
                .reminders(null)
                .build());
    }

    @Test
    @DisplayName("08:00 tokenre csak a 08:00-as (és a szóközös 08:00-as) emlékeztetőt adja vissza")
    void findReminderCandidates_08_00_returnsOnlyMatchingRows() {
        List<ProfileMedication> result = profileMedicationRepository.findReminderCandidates("\"08:00\"");

        assertThat(result)
                .extracting(ProfileMedication::getId)
                .containsExactlyInAnyOrder(morningReminder.getId(), whitespaceReminder.getId());
    }

    @Test
    @DisplayName("18:00 tokenre csak a 18:00-as emlékeztetőt adja vissza")
    void findReminderCandidates_18_00_returnsOnlyMatchingRow() {
        List<ProfileMedication> result = profileMedicationRepository.findReminderCandidates("\"18:00\"");

        assertThat(result)
                .extracting(ProfileMedication::getId)
                .containsExactly(eveningReminder.getId());
    }

    @Test
    @DisplayName("NULL reminders mezőjű sor nem okoz hibát és nem kerül a találatok közé")
    void findReminderCandidates_nullReminders_notReturnedAndNoError() {
        List<ProfileMedication> result = profileMedicationRepository.findReminderCandidates("\"08:00\"");

        assertThat(result)
                .extracting(ProfileMedication::getId)
                .doesNotContain(nullReminder.getId());
    }

    @Test
    @DisplayName("Pontos HH:mm+idézőjel token: a 08:00 sosem egyezik a 18:00-val (substring csapda elkerülve)")
    void findReminderCandidates_exactQuotedToken_neverMatchesDifferentTime() {
        List<ProfileMedication> result = profileMedicationRepository.findReminderCandidates("\"08:00\"");

        assertThat(result)
                .extracting(ProfileMedication::getId)
                .doesNotContain(eveningReminder.getId());
    }

    @Test
    @DisplayName("Fetch join: em.clear() után is olvasható a profile.user.email és a medication.name")
    void findReminderCandidates_fetchJoinsAssociations_readableAfterClear() {
        List<ProfileMedication> result = profileMedicationRepository.findReminderCandidates("\"08:00\"");
        em.clear();

        ProfileMedication found = result.stream()
                .filter(pm -> pm.getId().equals(morningReminder.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(found.getProfile().getUser().getEmail()).isEqualTo("reminder-repo@test.com");
        assertThat(found.getMedication().getName()).isEqualTo("Reggeli gyógyszer");
    }
}
