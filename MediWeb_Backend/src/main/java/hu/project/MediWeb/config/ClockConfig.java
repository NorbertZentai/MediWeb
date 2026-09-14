package hu.project.MediWeb.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Regisztrál egy Europe/Budapest zónájú, valós idejű {@link Clock} beant, hogy a
 * notification modul ütemezett feladatai (NotificationService, MissedMedicationScheduler)
 * ne a JVM alapértelmezett (konténerben UTC) idejét használják.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Europe/Budapest"));
    }
}
