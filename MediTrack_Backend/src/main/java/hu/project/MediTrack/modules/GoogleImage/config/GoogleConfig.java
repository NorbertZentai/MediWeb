package hu.project.MediTrack.modules.GoogleImage.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "google.api")
public class GoogleConfig {
    private String key;
    private String cx;
}
