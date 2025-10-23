package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.profile.dto.MultiDayReminderGroup;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediWeb.modules.user.entity.User;
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
public class NotificationService {

    private final ProfileMedicationRepository profileMedicationRepository;
    private final EmailNotificationService emailNotificationService;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(cron = "0 * * * * *")
    public void sendScheduledReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        List<ProfileMedication> allProfileMedications = profileMedicationRepository.findAll();

        for (ProfileMedication med : allProfileMedications) {
            try {
                List<MultiDayReminderGroup> groups = parseReminders(med.getReminders());
                if (groups.isEmpty()) {
                    continue;
                }

                User owner = med.getProfile().getUser();
                if (owner == null || Boolean.FALSE.equals(owner.getEmailNotificationsEnabled())) {
                    log.debug("Skipping email notification for medication {} because user opted out", med.getMedication().getName());
                    continue;
                }

                for (MultiDayReminderGroup group : groups) {
                    if (!group.getDays().contains(getDayCode(today.getDayOfWeek()))) {
                        continue;
                    }

                    for (String time : group.getTimes()) {
                        LocalTime reminderTime = LocalTime.parse(time, formatter);
                        if (now.equals(reminderTime)) {
                            String medicationName = med.getMedication().getName();
                            emailNotificationService.sendMedicationReminder(
                                    owner,
                                    medicationName,
                                    today,
                                    reminderTime,
                                    med.getNotes()
                            );
                            log.info("Értesítés elküldve: {} – {} [{}]", owner.getEmail(), medicationName, time);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Hiba történt a reminder feldolgozása során", e);
            }
        }
    }
}