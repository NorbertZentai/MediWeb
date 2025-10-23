package hu.project.MediWeb.modules.notification.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "notification.email")
public class EmailNotificationProperties {

    /**
     * Feladó email cím (pl. noreply@mediweb.app)
     */
    private String from;

    /**
     * Felhasználói beállítások oldalának URL-je, amelyre az email sablonból hivatkozunk.
     */
    private String managePreferencesUrl;

    /**
     * Támogatási email cím, ha a felhasználó kérdést szeretne feltenni.
     */
    private String supportEmail;
}
