package hu.project.MediTrack.modules.notification.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediTrack.modules.profile.dto.MultiDayReminderGroup;
import hu.project.MediTrack.modules.profile.entity.ProfileMedication;
import hu.project.MediTrack.modules.profile.repository.ProfileMedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final ProfileMedicationRepository profileMedicationRepository;
    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(cron = "0 * * * * *")
    public void sendScheduledReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        List<ProfileMedication> allProfileMedications = profileMedicationRepository.findAll();

        for (ProfileMedication med : allProfileMedications) {
            try {
                List<MultiDayReminderGroup> groups = objectMapper.readValue(med.getReminders(), new TypeReference<>() {});
                if (groups.isEmpty()) continue;

                for (MultiDayReminderGroup group : groups) {
                    if (!group.getDays().contains(getDayCode(today.getDayOfWeek()))) {
                        continue;
                    }

                    for (String time : group.getTimes()) {
                        if (now.equals(LocalTime.parse(time, formatter))) {
                            String email = med.getProfile().getUser().getEmail();
                            String medicationName = med.getMedication().getName();
                            sendEmail(email, medicationName);
                            log.info("Értesítés elküldve: {} – {} [{}]", email, medicationName, time);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Hiba történt a reminder feldolgozása során", e);
            }
        }
    }

    private String getDayCode(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "H";
            case TUESDAY -> "K";
            case WEDNESDAY -> "Sze";
            case THURSDAY -> "Cs";
            case FRIDAY -> "P";
            case SATURDAY -> "Szo";
            case SUNDAY -> "V";
        };
    }

    private void sendEmail(String to, String medicationName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Gyógyszer emlékeztető");
        message.setText("Ne feledd bevenni a(z) " + medicationName + " gyógyszert most!");
        mailSender.send(message);
    }
}