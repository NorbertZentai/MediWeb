package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.notification.entity.MedicationIntakeLog;
import hu.project.MediWeb.modules.notification.repository.MedicationIntakeLogRepository;
import hu.project.MediWeb.modules.profile.dto.MultiDayReminderGroup;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static hu.project.MediWeb.modules.notification.utils.ReminderUtils.getDayCode;
import static hu.project.MediWeb.modules.notification.utils.ReminderUtils.parseReminders;

@Slf4j
@Service
@RequiredArgsConstructor
public class MissedMedicationScheduler {

    private final ProfileMedicationRepository profileMedicationRepository;
    private final MedicationIntakeLogRepository intakeLogRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(cron = "0 * * * * *")
    public void checkMissedMedications() {
        LocalDate today = LocalDate.now();
        LocalTime checkTime = LocalTime.now().minusMinutes(1).withSecond(0).withNano(0);
        String dayCode = getDayCode(today.getDayOfWeek());

        List<ProfileMedication> allMedications = profileMedicationRepository.findAll();

        for (ProfileMedication med : allMedications) {
            try {
                List<MultiDayReminderGroup> groups = parseReminders(med.getReminders());

                for (MultiDayReminderGroup group : groups) {
                    if (!group.getDays().contains(dayCode)) {
                        continue;
                    }

                    for (String time : group.getTimes()) {
                        LocalTime scheduledTime = LocalTime.parse(time, formatter);

                        if (checkTime.equals(scheduledTime)) {
                            boolean exists = intakeLogRepository.existsByProfileMedicationAndIntakeDateAndIntakeTime(
                                    med, today, scheduledTime
                            );

                            if (!exists) {
                                MedicationIntakeLog missedLog = MedicationIntakeLog.builder()
                                        .profileMedication(med)
                                        .intakeDate(today)
                                        .intakeTime(scheduledTime)
                                        .taken(false)
                                        .recordedAt(null)
                                        .build();

                                intakeLogRepository.save(missedLog);
                                log.info("Elmulasztott gyógyszer rögzítve: {} – {} [{}]",
                                        med.getMedication().getName(),
                                        med.getProfile().getName(),
                                        time);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Hiba az elmulasztott gyógyszer ellenőrzése során: {}", med.getId(), e);
            }
        }
    }
}
