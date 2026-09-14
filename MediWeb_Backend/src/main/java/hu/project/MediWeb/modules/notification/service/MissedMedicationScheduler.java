package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.notification.entity.MedicationIntakeLog;
import hu.project.MediWeb.modules.notification.repository.MedicationIntakeLogRepository;
import hu.project.MediWeb.modules.notification.utils.ReminderUtils;
import hu.project.MediWeb.modules.profile.dto.MultiDayReminderGroup;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static hu.project.MediWeb.modules.notification.utils.ReminderUtils.parseReminders;

@Slf4j
@Service
@RequiredArgsConstructor
public class MissedMedicationScheduler {

    private final ProfileMedicationRepository profileMedicationRepository;
    private final MedicationIntakeLogRepository intakeLogRepository;
    private final Clock clock;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(cron = "0 * * * * *", zone = "Europe/Budapest")
    public void checkMissedMedications() {
        ZonedDateTime nowZdt = ZonedDateTime.now(clock);
        ZonedDateTime checkZdt = nowZdt.minusMinutes(1);
        LocalDate checkDate = checkZdt.toLocalDate();
        LocalTime checkTime = checkZdt.toLocalTime().withSecond(0).withNano(0);
        String time = checkTime.format(formatter);

        List<ProfileMedication> allMedications = profileMedicationRepository.findAll();

        for (ProfileMedication med : allMedications) {
            try {
                List<MultiDayReminderGroup> groups = parseReminders(med.getReminders());
                if (!ReminderUtils.isDueAt(groups, checkDate, checkTime)) {
                    continue;
                }

                boolean exists = intakeLogRepository.existsByProfileMedicationAndIntakeDateAndIntakeTime(
                        med, checkDate, checkTime
                );

                if (!exists) {
                    MedicationIntakeLog missedLog = MedicationIntakeLog.builder()
                            .profileMedication(med)
                            .intakeDate(checkDate)
                            .intakeTime(checkTime)
                            .taken(false)
                            .recordedAt(null)
                            .build();

                    intakeLogRepository.save(missedLog);
                    log.info("Elmulasztott gyógyszer rögzítve: {} – {} [{}]",
                            med.getMedication().getName(),
                            med.getProfile().getName(),
                            time);
                }
            } catch (Exception e) {
                log.error("Hiba az elmulasztott gyógyszer ellenőrzése során: {}", med.getId(), e);
            }
        }
    }
}
