package hu.project.MediWeb.modules.GoogleImage.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "google.api")
public class GoogleConfig {
    private String key;
    private String cx;
    
    public void logConfiguration() {
        System.out.println("⚙️ [GOOGLE-CONFIG] === Configuration Debug ===");
        System.out.println("⚙️ [GOOGLE-CONFIG] Environment variable GOOGLE_API_KEY: " + System.getenv("GOOGLE_API_KEY"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Environment variable GOOGLE_SEARCH_ENGINE_ID: " + System.getenv("GOOGLE_SEARCH_ENGINE_ID"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Environment variable GOOGLE_CX: " + System.getenv("GOOGLE_CX"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Loaded google.api.key: " + (key != null ? key.substring(0, Math.min(10, key.length())) + "..." : "null"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Loaded google.api.cx: " + (cx != null ? cx : "null"));
        System.out.println("⚙️ [GOOGLE-CONFIG] === End Configuration ===");
    }
}
