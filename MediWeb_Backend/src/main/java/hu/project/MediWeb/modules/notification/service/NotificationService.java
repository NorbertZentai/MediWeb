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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static hu.project.MediWeb.modules.notification.utils.ReminderUtils.getDayCode;
import static hu.project.MediWeb.modules.notification.utils.ReminderUtils.parseReminders;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final ProfileMedicationRepository profileMedicationRepository;
    private final EmailNotificationService emailNotificationService;
    private final PushNotificationService pushNotificationService;
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
                if (owner == null) {
                    continue;
                }

                boolean emailEnabled = Boolean.TRUE.equals(owner.getEmailNotificationsEnabled());
                boolean pushEnabled = Boolean.TRUE.equals(owner.getPushNotificationsEnabled());

                if (!emailEnabled && !pushEnabled) {
                    log.debug("Skipping all notifications for medication {} because user opted out of both email and push",
                            med.getMedication().getName());
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

                            if (emailEnabled) {
                                emailNotificationService.sendMedicationReminder(
                                        owner,
                                        medicationName,
                                        today,
                                        reminderTime,
                                        med.getNotes()
                                );
                                log.info("Email értesítés elküldve: {} – {} [{}]", owner.getEmail(), medicationName, time);
                            }

                            if (pushEnabled) {
                                String title = "Gyógyszer emlékeztető";
                                String body = medicationName + " – " + time;
                                Map<String, Object> data = new HashMap<>();
                                data.put("type", "medication_reminder");
                                data.put("medicationName", medicationName);
                                data.put("time", time);

                                pushNotificationService.sendPushNotification(owner, title, body, data);
                                log.info("Push értesítés elküldve: {} – {} [{}]", owner.getEmail(), medicationName, time);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Hiba történt a reminder feldolgozása során", e);
            }
        }
    }
}
