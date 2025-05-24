package hu.project.MediTrack.modules.notification.service;

import hu.project.MediTrack.modules.notification.dto.IntakeSubmissionRequest;
import hu.project.MediTrack.modules.notification.dto.TodaysMedicationDTO;
import hu.project.MediTrack.modules.notification.entity.MedicationIntakeLog;
import hu.project.MediTrack.modules.notification.repository.MedicationIntakeLogRepository;
import hu.project.MediTrack.modules.profile.dto.MultiDayReminderGroup;
import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import hu.project.MediTrack.modules.profile.repository.ProfileMedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static hu.project.MediTrack.modules.notification.utils.ReminderUtils.*;

@Service
@RequiredArgsConstructor
public class MedicationIntakeService {

    private final ProfileMedicationRepository medicationRepository;
    private final MedicationIntakeLogRepository intakeLogRepository;

    public List<TodaysMedicationDTO> getMedicationsForToday(Long profileId) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        String dayCode = getDayCode(today);

        List<ProfileMedication> medications = medicationRepository.findByProfileId(profileId);
        List<TodaysMedicationDTO> result = new ArrayList<>();

        for (ProfileMedication med : medications) {
            try {
                List<MultiDayReminderGroup> groups = parseReminders(med.getReminders());
                List<String> timesToday = new ArrayList<>();

                for (MultiDayReminderGroup group : groups) {
                    if (group.getDays().contains(dayCode)) {
                        timesToday.addAll(group.getTimes());
                    }
                }

                if (!timesToday.isEmpty()) {
                    List<Boolean> takenFlags = new ArrayList<>();
                    for (String time : timesToday) {
                        Boolean taken = intakeLogRepository
                                .findByProfileMedicationAndIntakeDateAndIntakeTime(
                                        med,
                                        LocalDate.now(),
                                        LocalTime.parse(time)
                                )
                                .map(MedicationIntakeLog::isTaken)
                                .orElse(false);
                        takenFlags.add(taken);
                    }

                    result.add(new TodaysMedicationDTO(
                            med.getId(),
                            med.getMedication().getName(),
                            timesToday,
                            takenFlags
                    ));
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return result;
    }

    public void recordIntake(IntakeSubmissionRequest request) {
        ProfileMedication medication = medicationRepository.findById(request.getProfileMedicationId())
                .orElseThrow(() -> new IllegalArgumentException("Nincs ilyen gyógyszerkapcsolat"));

        MedicationIntakeLog log = intakeLogRepository
                .findByProfileMedicationAndIntakeDateAndIntakeTime(
                        medication,
                        LocalDate.now(),
                        LocalTime.parse(request.getTime())
                )
                .orElse(MedicationIntakeLog.builder()
                        .profileMedication(medication)
                        .intakeDate(LocalDate.now())
                        .intakeTime(LocalTime.parse(request.getTime()))
                        .build());

        log.setTaken(request.isTaken());
        intakeLogRepository.save(log);
    }
}