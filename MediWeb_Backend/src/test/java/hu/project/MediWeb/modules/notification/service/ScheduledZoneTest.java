package hu.project.MediWeb.modules.notification.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.Scheduled;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Reflexióval ellenőrzi, hogy a két perc-szintű scheduler Europe/Budapest zónára
 * van rögzítve, és a cron kifejezés nem változott.
 */
class ScheduledZoneTest {

    @Test
    @DisplayName("NotificationService.sendScheduledReminders Europe/Budapest zónájú")
    void notificationService_isPinnedToBudapestZone() throws NoSuchMethodException {
        Method method = NotificationService.class.getDeclaredMethod("sendScheduledReminders");
        Scheduled scheduled = method.getAnnotation(Scheduled.class);

        assertThat(scheduled).isNotNull();
        assertThat(scheduled.zone()).isEqualTo("Europe/Budapest");
        assertThat(scheduled.cron()).isEqualTo("0 * * * * *");
    }

    @Test
    @DisplayName("MissedMedicationScheduler.checkMissedMedications Europe/Budapest zónájú")
    void missedMedicationScheduler_isPinnedToBudapestZone() throws NoSuchMethodException {
        Method method = MissedMedicationScheduler.class.getDeclaredMethod("checkMissedMedications");
        Scheduled scheduled = method.getAnnotation(Scheduled.class);

        assertThat(scheduled).isNotNull();
        assertThat(scheduled.zone()).isEqualTo("Europe/Budapest");
        assertThat(scheduled.cron()).isEqualTo("0 * * * * *");
    }
}
