package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.notification.utils.ReminderUtils;
import hu.project.MediWeb.modules.profile.dto.MultiDayReminderGroup;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediWeb.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static hu.project.MediWeb.modules.notification.utils.ReminderUtils.parseReminders;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final ProfileMedicationRepository profileMedicationRepository;
    private final EmailNotificationService emailNotificationService;
    private final PushNotificationService pushNotificationService;
    private final Clock clock;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(cron = "0 * * * * *", zone = "Europe/Budapest")
    public void sendScheduledReminders() {
        ZonedDateTime nowZdt = ZonedDateTime.now(clock);
        LocalDate today = nowZdt.toLocalDate();
        LocalTime now = nowZdt.toLocalTime().withSecond(0).withNano(0);
        String time = now.format(formatter);

        List<ProfileMedication> allProfileMedications = profileMedicationRepository.findAll();

        for (ProfileMedication med : allProfileMedications) {
            try {
                List<MultiDayReminderGroup> groups = parseReminders(med.getReminders());
                if (!ReminderUtils.isDueAt(groups, today, now)) {
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

                String medicationName = med.getMedication().getName();

                if (emailEnabled) {
                    emailNotificationService.sendMedicationReminder(
                            owner,
                            medicationName,
                            today,
                            now,
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
            } catch (Exception e) {
                log.error("Hiba történt a reminder feldolgozása során", e);
            }
        }
    }
}
