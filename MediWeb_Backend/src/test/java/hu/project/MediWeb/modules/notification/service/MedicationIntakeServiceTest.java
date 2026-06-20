package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.notification.dto.IntakeSubmissionRequest;
import hu.project.MediWeb.modules.notification.dto.TodaysMedicationDTO;
import hu.project.MediWeb.modules.notification.entity.MedicationIntakeLog;
import hu.project.MediWeb.modules.notification.repository.MedicationIntakeLogRepository;
import hu.project.MediWeb.modules.notification.utils.ReminderUtils;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.profile.dto.MultiDayReminderGroup;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tesztek a {@link MedicationIntakeService}-hez.
 * A repository-k mockolva vannak; a recordIntake ágait (nincs gyógyszerkapcsolat,
 * meglévő log frissítése, új log létrehozása) és a getMedicationsForToday logikáját
 * teszteljük. A statikus {@link ReminderUtils}-t mockStatic-kal helyettesítjük, hogy
 * az aktuális naptól függetlenül, determinisztikusan fusson a teszt.
 */
@ExtendWith(MockitoExtension.class)
class MedicationIntakeServiceTest {

    @Mock
    private ProfileMedicationRepository medicationRepository;
    @Mock
    private MedicationIntakeLogRepository intakeLogRepository;

    @InjectMocks
    private MedicationIntakeService intakeService;

    // ---------- recordIntake ----------

    @Test
    @DisplayName("recordIntake: nincs gyógyszerkapcsolat → IllegalArgumentException, nem ment")
    void recordIntake_throws_whenMedicationNotFound() {
        IntakeSubmissionRequest request = IntakeSubmissionRequest.builder()
                .profileMedicationId(1L).time("08:00").taken(true).build();
        when(medicationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> intakeService.recordIntake(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Nincs ilyen gyógyszerkapcsolat");

        verify(intakeLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("recordIntake: meglévő logot frissít (taken + recordedAt), ugyanazt a logot menti")
    void recordIntake_updatesExistingLog() {
        IntakeSubmissionRequest request = IntakeSubmissionRequest.builder()
                .profileMedicationId(1L).time("08:00").taken(true).build();
        ProfileMedication medication = mock(ProfileMedication.class);
        MedicationIntakeLog existingLog = MedicationIntakeLog.builder().taken(false).build();

        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(intakeLogRepository.findByProfileMedicationAndIntakeDateAndIntakeTime(eq(medication), any(), any()))
                .thenReturn(Optional.of(existingLog));
        when(intakeLogRepository.save(any(MedicationIntakeLog.class))).thenAnswer(inv -> inv.getArgument(0));

        intakeService.recordIntake(request);

        ArgumentCaptor<MedicationIntakeLog> captor = ArgumentCaptor.forClass(MedicationIntakeLog.class);
        verify(intakeLogRepository).save(captor.capture());
        assertThat(captor.getValue()).isSameAs(existingLog);
        assertThat(captor.getValue().isTaken()).isTrue();
        assertThat(captor.getValue().getRecordedAt()).isNotNull();
    }

    @Test
    @DisplayName("recordIntake: ha nincs log, újat hoz létre a megfelelő mezőkkel, és menti")
    void recordIntake_createsNewLog_whenNoLogExists() {
        IntakeSubmissionRequest request = IntakeSubmissionRequest.builder()
                .profileMedicationId(1L).time("08:00").taken(true).build();
        ProfileMedication medication = mock(ProfileMedication.class);

        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(intakeLogRepository.findByProfileMedicationAndIntakeDateAndIntakeTime(eq(medication), any(), any()))
                .thenReturn(Optional.empty());
        when(intakeLogRepository.save(any(MedicationIntakeLog.class))).thenAnswer(inv -> inv.getArgument(0));

        intakeService.recordIntake(request);

        ArgumentCaptor<MedicationIntakeLog> captor = ArgumentCaptor.forClass(MedicationIntakeLog.class);
        verify(intakeLogRepository).save(captor.capture());
        MedicationIntakeLog saved = captor.getValue();
        assertThat(saved.getProfileMedication()).isSameAs(medication);
        assertThat(saved.getIntakeTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(saved.getIntakeDate()).isNotNull();
        assertThat(saved.isTaken()).isTrue();
        assertThat(saved.getRecordedAt()).isNotNull();
    }

    // ---------- getMedicationsForToday ----------

    @Test
    @DisplayName("getMedicationsForToday: nincs gyógyszer a profilhoz → üres lista")
    void getMedicationsForToday_returnsEmpty_whenNoMedications() {
        when(medicationRepository.findByProfileId(1L)).thenReturn(List.of());

        List<TodaysMedicationDTO> result = intakeService.getMedicationsForToday(1L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getMedicationsForToday: a mai napra ütemezett gyógyszert visszaadja a bevétel-jelzéssel")
    void getMedicationsForToday_includesMedicationScheduledToday() {
        ProfileMedication med = mock(ProfileMedication.class);
        Medication medication = mock(Medication.class);
        MultiDayReminderGroup group = new MultiDayReminderGroup();
        group.setDays(List.of("MON"));
        group.setTimes(List.of("08:00"));
        MedicationIntakeLog log = MedicationIntakeLog.builder().taken(true).build();

        when(medicationRepository.findByProfileId(1L)).thenReturn(List.of(med));
        when(med.getReminders()).thenReturn("raw-json");
        when(med.getId()).thenReturn(42L);
        when(med.getMedication()).thenReturn(medication);
        when(medication.getName()).thenReturn("Aspirin");
        when(intakeLogRepository.findByProfileMedicationAndIntakeDateAndIntakeTime(eq(med), any(), any()))
                .thenReturn(Optional.of(log));

        try (MockedStatic<ReminderUtils> utils = mockStatic(ReminderUtils.class)) {
            // a nap-kódot fixre állítjuk, és olyan csoportot adunk vissza, ami tartalmazza
            utils.when(() -> ReminderUtils.getDayCode(any())).thenReturn("MON");
            utils.when(() -> ReminderUtils.parseReminders("raw-json")).thenReturn(List.of(group));

            List<TodaysMedicationDTO> result = intakeService.getMedicationsForToday(1L);

            assertThat(result).hasSize(1);
            TodaysMedicationDTO dto = result.get(0);
            assertThat(dto.getProfileMedicationId()).isEqualTo(42L);
            assertThat(dto.getMedicationName()).isEqualTo("Aspirin");
            assertThat(dto.getTimes()).containsExactly("08:00");
            assertThat(dto.getTakenFlags()).containsExactly(true);
        }
    }
}
