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
        System.out.println("⚙️ [GOOGLE-CONFIG] === Configuration Debug ===");
        System.out.println("⚙️ [GOOGLE-CONFIG] Environment variable GOOGLE_API_KEY: " + System.getenv("GOOGLE_API_KEY"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Environment variable GOOGLE_SEARCH_ENGINE_ID: " + System.getenv("GOOGLE_SEARCH_ENGINE_ID"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Environment variable GOOGLE_CX: " + System.getenv("GOOGLE_CX"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Loaded google.api.key: " + (key != null ? key.substring(0, Math.min(10, key.length())) + "..." : "null"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Loaded google.api.cx: " + (cx != null ? cx : "null"));
        String resolvedKey = getKey();
        System.out.println("⚙️ [GOOGLE-CONFIG] Final getKey() result: " + (resolvedKey != null ? resolvedKey.substring(0, Math.min(10, resolvedKey.length())) + "..." : "null"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Final getCx() result: " + getCx());
        System.out.println("⚙️ [GOOGLE-CONFIG] Configured request delay: " + requestDelayMs + " ms");
        System.out.println("⚙️ [GOOGLE-CONFIG] Max requests per minute: " + (maxRequestsPerMinute > 0 ? maxRequestsPerMinute : "nincs korlát"));
        System.out.println("⚙️ [GOOGLE-CONFIG] Max requests per day: " + (maxRequestsPerDay > 0 ? maxRequestsPerDay : "nincs korlát"));
        System.out.println("⚙️ [GOOGLE-CONFIG] === End Configuration ===");
    }
}
