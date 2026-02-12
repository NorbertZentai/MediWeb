package hu.project.MediWeb.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserPreferencesDto {

    private NotificationPreferences notifications;
    private GeneralPreferences general;
    private DataPreferences data;

    public static UserPreferencesDto defaultPreferences() {
        return UserPreferencesDto.builder()
                .notifications(NotificationPreferences.defaults())
                .general(GeneralPreferences.defaults())
                .data(DataPreferences.defaults())
                .build();
    }

    public UserPreferencesDto withDefaults() {
        UserPreferencesDto defaults = defaultPreferences();

        if (notifications == null) {
            notifications = defaults.getNotifications();
        } else {
            notifications.applyDefaults(defaults.getNotifications());
        }

        if (general == null) {
            general = defaults.getGeneral();
        } else {
            general.applyDefaults(defaults.getGeneral());
        }

        if (data == null) {
            data = defaults.getData();
        } else {
            data.applyDefaults(defaults.getData());
        }

        return this;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NotificationPreferences {
        private Boolean medicationReminders;
        private Boolean summaryEmails;
        private Boolean refillAlerts;
        private Boolean pushEnabled;

        public static NotificationPreferences defaults() {
            return NotificationPreferences.builder()
                    .medicationReminders(true)
                    .summaryEmails(true)
                    .refillAlerts(false)
                    .pushEnabled(true)
                    .build();
        }

        public void applyDefaults(NotificationPreferences defaults) {
            if (medicationReminders == null) {
                medicationReminders = defaults.getMedicationReminders();
            }
            if (summaryEmails == null) {
                summaryEmails = defaults.getSummaryEmails();
            }
            if (refillAlerts == null) {
                refillAlerts = defaults.getRefillAlerts();
            }
            if (pushEnabled == null) {
                pushEnabled = defaults.getPushEnabled();
            }
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeneralPreferences {
        private String language;
        private String theme;
        private String timezone;
        private String dailyDigestHour;

        public static GeneralPreferences defaults() {
            return GeneralPreferences.builder()
                    .language("hu")
                    .theme("system")
                    .timezone("Europe/Budapest")
                    .dailyDigestHour("08:00")
                    .build();
        }

        public void applyDefaults(GeneralPreferences defaults) {
            if (language == null || language.isBlank()) {
                language = defaults.getLanguage();
            }
            if (theme == null || theme.isBlank()) {
                theme = defaults.getTheme();
            }
            if (timezone == null || timezone.isBlank()) {
                timezone = defaults.getTimezone();
            }
            if (dailyDigestHour == null || dailyDigestHour.isBlank()) {
                dailyDigestHour = defaults.getDailyDigestHour();
            }
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataPreferences {
        private Boolean anonymizedAnalytics;

        public static DataPreferences defaults() {
            return DataPreferences.builder()
                    .anonymizedAnalytics(true)
                    .build();
        }

        public void applyDefaults(DataPreferences defaults) {
            if (anonymizedAnalytics == null) {
                anonymizedAnalytics = defaults.getAnonymizedAnalytics();
            }
        }
    }
}
