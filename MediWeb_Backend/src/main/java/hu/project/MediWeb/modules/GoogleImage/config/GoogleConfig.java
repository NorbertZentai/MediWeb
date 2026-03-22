package hu.project.MediWeb.modules.GoogleImage.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "google.api")
public class GoogleConfig {
    private String key;
    private String cx;
    private long requestDelayMs = 1000L;
    private int maxRequestsPerMinute = 30;
    private int maxRequestsPerDay = 400;
    
    public String getKey() {
        if (key != null && !key.isEmpty()) {
            return key;
        }
        String envKey = System.getenv("GOOGLE_API_KEY");
        if (envKey != null && !envKey.isEmpty()) {
            return envKey;
        }
        envKey = System.getenv("GOOGLE_CUSTOM_SEARCH_KEY");
        if (envKey != null && !envKey.isEmpty()) {
            return envKey;
        }
        return key;
    }

    // Fallback method to get CX from environment if Spring binding fails
    public String getCx() {
        if (cx != null && !cx.isEmpty()) {
            return cx;
        }
        // Try environment variables directly
        String envCx = System.getenv("GOOGLE_SEARCH_ENGINE_ID");
        if (envCx != null && !envCx.isEmpty()) {
            return envCx;
        }
        envCx = System.getenv("GOOGLE_CX");
        if (envCx != null && !envCx.isEmpty()) {
            return envCx;
        }
        return cx;
    }
    
    public void logConfiguration() {
        log.debug("[GOOGLE-CONFIG] === Configuration Debug ===");
        log.debug("[GOOGLE-CONFIG] Environment variable GOOGLE_API_KEY present: {}", System.getenv("GOOGLE_API_KEY") != null);
        log.debug("[GOOGLE-CONFIG] Environment variable GOOGLE_SEARCH_ENGINE_ID present: {}", System.getenv("GOOGLE_SEARCH_ENGINE_ID") != null);
        log.debug("[GOOGLE-CONFIG] Environment variable GOOGLE_CX present: {}", System.getenv("GOOGLE_CX") != null);
        log.debug("[GOOGLE-CONFIG] Loaded google.api.key present: {}", key != null && !key.isEmpty());
        log.debug("[GOOGLE-CONFIG] Loaded google.api.cx present: {}", cx != null && !cx.isEmpty());
        String resolvedKey = getKey();
        log.debug("[GOOGLE-CONFIG] Final getKey() present: {}", resolvedKey != null && !resolvedKey.isEmpty());
        log.debug("[GOOGLE-CONFIG] Final getCx() present: {}", getCx() != null && !getCx().isEmpty());
        log.debug("[GOOGLE-CONFIG] Configured request delay: {} ms", requestDelayMs);
        log.debug("[GOOGLE-CONFIG] Max requests per minute: {}", maxRequestsPerMinute > 0 ? maxRequestsPerMinute : "nincs korlat");
        log.debug("[GOOGLE-CONFIG] Max requests per day: {}", maxRequestsPerDay > 0 ? maxRequestsPerDay : "nincs korlat");
        log.debug("[GOOGLE-CONFIG] === End Configuration ===");
    }
}
