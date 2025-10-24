package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.notification.config.EmailNotificationProperties;
import hu.project.MediWeb.modules.user.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MMMM d.");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailNotificationProperties properties;

    public void sendMedicationReminder(User user,
                                       String medicationName,
                                       LocalDate targetDate,
                                       LocalTime targetTime,
                                       String additionalNotes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setTo(user.getEmail());
            if (properties.getFrom() != null && !properties.getFrom().isBlank()) {
                helper.setFrom(properties.getFrom());
            }
            helper.setSubject("MediWeb – gyógyszer emlékeztető");

            Context context = new Context();
            context.setVariable("userName", user.getName());
            context.setVariable("medicationName", medicationName);
            context.setVariable("formattedDate", targetDate.format(DATE_FORMATTER));
            context.setVariable("formattedTime", targetTime.format(TIME_FORMATTER));
            context.setVariable("additionalNotes", additionalNotes != null && !additionalNotes.isBlank() ? additionalNotes : "Ne feledd bevenni a gyógyszert a fenti időpontban.");

            String managePreferencesUrl = properties.getManagePreferencesUrl();
            if (managePreferencesUrl == null || managePreferencesUrl.isBlank()) {
                managePreferencesUrl = "#";
            }
            context.setVariable("managePreferencesUrl", managePreferencesUrl);

            String supportEmail = properties.getSupportEmail();
            if (supportEmail == null || supportEmail.isBlank()) {
                supportEmail = "support@mediweb.app";
            }
            context.setVariable("supportEmail", supportEmail);
            context.setVariable("supportEmailLink", "mailto:" + supportEmail);

            String htmlBody = templateEngine.process("email/medication-reminder", context);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email reminder sent to {} for medication {}", user.getEmail(), medicationName);
        } catch (MessagingException e) {
            log.error("Failed to construct email notification for user {}", user.getEmail(), e);
        } catch (Exception e) {
            log.error("Unexpected error while sending email notification", e);
        }
    }
}
