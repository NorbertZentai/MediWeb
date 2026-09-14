package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediWeb.modules.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tesztek a {@link NotificationService}-hez, egy {@link Clock#fixed} órával
 * determinisztikussá téve az emlékeztető ütemezést. #54 óta a szolgáltatás a
 * {@link ProfileMedicationRepository#findReminderCandidates(String)} időtoken-alapú
 * lekérdezést hívja {@code findAll()} helyett.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    private static final ZoneId BUDAPEST = ZoneId.of("Europe/Budapest");

    @Mock
    private ProfileMedicationRepository profileMedicationRepository;
    @Mock
    private EmailNotificationService emailNotificationService;
    @Mock
    private PushNotificationService pushNotificationService;

    private static Clock fixedClockAt(String isoLocalDateTime) {
        return Clock.fixed(
                java.time.LocalDateTime.parse(isoLocalDateTime).atZone(BUDAPEST).toInstant(),
                BUDAPEST
        );
    }

    private static User owner(boolean emailEnabled, boolean pushEnabled) {
        return User.builder()
                .id(1L)
                .name("Teszt Elek")
                .email("teszt@example.com")
                .password("irrelevant")
                .emailNotificationsEnabled(emailEnabled)
                .pushNotificationsEnabled(pushEnabled)
                .build();
    }

    private static ProfileMedication medicationWithReminders(User owner, String remindersJson, String medicationName) {
        Profile profile = Profile.builder().id(1L).user(owner).name("Fő profil").build();
        Medication medication = Medication.builder().id(10L).name(medicationName).build();
        return ProfileMedication.builder()
                .id(100L)
                .profile(profile)
                .medication(medication)
                .notes("megjegyzés")
                .reminders(remindersJson)
                .build();
    }

    /** findAll() sosem szabadna hívódnia #54 után; ha mégis, üres listát ad, hogy ne NPE-zzen a régi kód. */
    private void stubFindAllNeverUsed() {
        lenient().when(profileMedicationRepository.findAll()).thenReturn(List.of());
    }

    @Test
    @DisplayName("Esedékes emlékeztetőnél a candidate query hívódik a pontos tokennel, email-t és push-t is küld")
    void dueReminder_callsCandidateQueryWithToken_andSendsEmailAndPush() {
        Clock clock = fixedClockAt("2026-09-14T08:00:30");
        NotificationService service = new NotificationService(
                profileMedicationRepository, emailNotificationService, pushNotificationService, clock);
        User owner = owner(true, true);
        ProfileMedication med = medicationWithReminders(owner, "[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]", "Aspirin");

        stubFindAllNeverUsed();
        when(profileMedicationRepository.findReminderCandidates("\"08:00\"")).thenReturn(List.of(med));

        service.sendScheduledReminders();

        verify(profileMedicationRepository, times(1)).findReminderCandidates("\"08:00\"");
        verify(profileMedicationRepository, never()).findAll();
        verify(emailNotificationService, times(1)).sendMedicationReminder(
                eq(owner), eq("Aspirin"), eq(LocalDate.of(2026, 9, 14)), eq(LocalTime.of(8, 0)), eq("megjegyzés"));
        verify(pushNotificationService, times(1)).sendPushNotification(eq(owner), anyString(), anyString(), anyMap());
    }

    @Test
    @DisplayName("08:01-kor nem esedékes, nincs értesítés, de a candidate query akkor is a 08:01 tokennel fut")
    void oneMinuteLater_sendsNothing() {
        Clock clock = fixedClockAt("2026-09-14T08:01:00");
        NotificationService service = new NotificationService(
                profileMedicationRepository, emailNotificationService, pushNotificationService, clock);

        stubFindAllNeverUsed();
        when(profileMedicationRepository.findReminderCandidates("\"08:01\"")).thenReturn(List.of());

        service.sendScheduledReminders();

        verify(profileMedicationRepository, times(1)).findReminderCandidates("\"08:01\"");
        verify(profileMedicationRepository, never()).findAll();
        verify(emailNotificationService, never()).sendMedicationReminder(any(), any(), any(), any(), any());
        verify(pushNotificationService, never()).sendPushNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Keddi napon a hétfőre beállított candidate (jó idő, rossz nap) nem esedékes")
    void wrongDayCandidateFromQuery_sendsNothing() {
        Clock clock = fixedClockAt("2026-09-15T08:00:30");
        NotificationService service = new NotificationService(
                profileMedicationRepository, emailNotificationService, pushNotificationService, clock);
        User owner = owner(true, true);
        ProfileMedication med = medicationWithReminders(owner, "[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]", "Aspirin");

        stubFindAllNeverUsed();
        when(profileMedicationRepository.findReminderCandidates("\"08:00\"")).thenReturn(List.of(med));

        service.sendScheduledReminders();

        verify(profileMedicationRepository, times(1)).findReminderCandidates("\"08:00\"");
        verify(profileMedicationRepository, never()).findAll();
        verify(emailNotificationService, never()).sendMedicationReminder(any(), any(), any(), any(), any());
        verify(pushNotificationService, never()).sendPushNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Csak email van kikapcsolva: push megy, email nem")
    void emailDisabled_onlyPushSent() {
        Clock clock = fixedClockAt("2026-09-14T08:00:00");
        NotificationService service = new NotificationService(
                profileMedicationRepository, emailNotificationService, pushNotificationService, clock);
        User owner = owner(false, true);
        ProfileMedication med = medicationWithReminders(owner, "[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]", "Aspirin");

        stubFindAllNeverUsed();
        when(profileMedicationRepository.findReminderCandidates("\"08:00\"")).thenReturn(List.of(med));

        service.sendScheduledReminders();

        verify(profileMedicationRepository, never()).findAll();
        verify(emailNotificationService, never()).sendMedicationReminder(any(), any(), any(), any(), any());
        verify(pushNotificationService, times(1)).sendPushNotification(eq(owner), anyString(), anyString(), anyMap());
    }

    @Test
    @DisplayName("Mindkét csatorna kikapcsolva: semmi sem megy ki")
    void bothDisabled_sendsNothing() {
        Clock clock = fixedClockAt("2026-09-14T08:00:00");
        NotificationService service = new NotificationService(
                profileMedicationRepository, emailNotificationService, pushNotificationService, clock);
        User owner = owner(false, false);
        ProfileMedication med = medicationWithReminders(owner, "[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]", "Aspirin");

        stubFindAllNeverUsed();
        when(profileMedicationRepository.findReminderCandidates("\"08:00\"")).thenReturn(List.of(med));

        service.sendScheduledReminders();

        verify(profileMedicationRepository, never()).findAll();
        verify(emailNotificationService, never()).sendMedicationReminder(any(), any(), any(), any(), any());
        verify(pushNotificationService, never()).sendPushNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Hibás reminders JSON esetén a ciklus a következő, érvényes gyógyszerrel folytatódik")
    void invalidReminders_skippedButLoopContinues() {
        Clock clock = fixedClockAt("2026-09-14T08:00:00");
        NotificationService service = new NotificationService(
                profileMedicationRepository, emailNotificationService, pushNotificationService, clock);
        User owner = owner(true, true);
        ProfileMedication invalidMed = medicationWithReminders(owner, "not-a-valid-json", "Rossz gyógyszer");
        ProfileMedication validMed = medicationWithReminders(owner, "[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]", "Jó gyógyszer");

        stubFindAllNeverUsed();
        when(profileMedicationRepository.findReminderCandidates("\"08:00\"")).thenReturn(List.of(invalidMed, validMed));

        service.sendScheduledReminders();

        verify(profileMedicationRepository, never()).findAll();
        verify(emailNotificationService, times(1)).sendMedicationReminder(
                eq(owner), eq("Jó gyógyszer"), eq(LocalDate.of(2026, 9, 14)), eq(LocalTime.of(8, 0)), any());
        verify(pushNotificationService, times(1)).sendPushNotification(eq(owner), anyString(), anyString(), anyMap());
    }
}
