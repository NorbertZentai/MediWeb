package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.notification.entity.MedicationIntakeLog;
import hu.project.MediWeb.modules.notification.repository.MedicationIntakeLogRepository;
import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tesztek a {@link MissedMedicationScheduler}-hez, kiemelten az éjfélkor
 * jelentkező dátum-átfordulási hibára ("midnight fix").
 */
@ExtendWith(MockitoExtension.class)
class MissedMedicationSchedulerTest {

    private static final ZoneId BUDAPEST = ZoneId.of("Europe/Budapest");

    @Mock
    private ProfileMedicationRepository profileMedicationRepository;
    @Mock
    private MedicationIntakeLogRepository intakeLogRepository;

    private static Clock fixedClockAt(String isoLocalDateTime) {
        return Clock.fixed(
                LocalDateTime.parse(isoLocalDateTime).atZone(BUDAPEST).toInstant(),
                BUDAPEST
        );
    }

    private static ProfileMedication medicationWithReminders(String remindersJson) {
        Profile profile = Profile.builder().id(1L).name("Fő profil").build();
        Medication medication = Medication.builder().id(10L).name("Aspirin").build();
        return ProfileMedication.builder()
                .id(100L)
                .profile(profile)
                .medication(medication)
                .reminders(remindersJson)
                .build();
    }

    @Test
    @DisplayName("08:01-es futás rögzíti a 08:00-as elmulasztott dózist")
    void normalRun_recordsMissedDose() {
        Clock clock = fixedClockAt("2026-09-14T08:01:00");
        MissedMedicationScheduler scheduler = new MissedMedicationScheduler(
                profileMedicationRepository, intakeLogRepository, clock);
        ProfileMedication med = medicationWithReminders("[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]");

        when(profileMedicationRepository.findAll()).thenReturn(List.of(med));
        when(intakeLogRepository.existsByProfileMedicationAndIntakeDateAndIntakeTime(
                med, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0)))
                .thenReturn(false);

        scheduler.checkMissedMedications();

        ArgumentCaptor<MedicationIntakeLog> captor = ArgumentCaptor.forClass(MedicationIntakeLog.class);
        verify(intakeLogRepository, times(1)).save(captor.capture());
        MedicationIntakeLog saved = captor.getValue();
        assertThat(saved.getIntakeDate()).isEqualTo(LocalDate.of(2026, 9, 14));
        assertThat(saved.getIntakeTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(saved.isTaken()).isFalse();
    }

    @Test
    @DisplayName("Ha már létezik log, nem menti újra")
    void existingLog_isNotSavedAgain() {
        Clock clock = fixedClockAt("2026-09-14T08:01:00");
        MissedMedicationScheduler scheduler = new MissedMedicationScheduler(
                profileMedicationRepository, intakeLogRepository, clock);
        ProfileMedication med = medicationWithReminders("[{\"days\":[\"H\"],\"times\":[\"08:00\"]}]");

        when(profileMedicationRepository.findAll()).thenReturn(List.of(med));
        when(intakeLogRepository.existsByProfileMedicationAndIntakeDateAndIntakeTime(
                med, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0)))
                .thenReturn(true);

        scheduler.checkMissedMedications();

        verify(intakeLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("Éjfélkor futva a tegnapi 23:59-es dózist a tegnapi dátummal rögzíti")
    void midnightRun_recordsYesterdaysDoseWithYesterdaysDate() {
        Clock clock = fixedClockAt("2026-09-15T00:00:10");
        MissedMedicationScheduler scheduler = new MissedMedicationScheduler(
                profileMedicationRepository, intakeLogRepository, clock);
        ProfileMedication med = medicationWithReminders("[{\"days\":[\"H\"],\"times\":[\"23:59\"]}]");

        when(profileMedicationRepository.findAll()).thenReturn(List.of(med));
        when(intakeLogRepository.existsByProfileMedicationAndIntakeDateAndIntakeTime(
                med, LocalDate.of(2026, 9, 14), LocalTime.of(23, 59)))
                .thenReturn(false);

        scheduler.checkMissedMedications();

        verify(intakeLogRepository, times(1)).existsByProfileMedicationAndIntakeDateAndIntakeTime(
                eq(med), eq(LocalDate.of(2026, 9, 14)), eq(LocalTime.of(23, 59)));

        ArgumentCaptor<MedicationIntakeLog> captor = ArgumentCaptor.forClass(MedicationIntakeLog.class);
        verify(intakeLogRepository, times(1)).save(captor.capture());
        MedicationIntakeLog saved = captor.getValue();
        assertThat(saved.getIntakeDate()).isEqualTo(LocalDate.of(2026, 9, 14));
        assertThat(saved.getIntakeTime()).isEqualTo(LocalTime.of(23, 59));
        assertThat(saved.isTaken()).isFalse();
    }
}
