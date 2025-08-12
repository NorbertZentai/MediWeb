package hu.project.MediWeb.modules.GoogleImage.service;

import hu.project.MediWeb.modules.GoogleImage.config.GoogleConfig;
import hu.project.MediWeb.modules.GoogleImage.dto.GoogleImageResult;
import hu.project.MediWeb.modules.GoogleImage.dto.GoogleSearchResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import jakarta.annotation.PostConstruct;
import java.util.Comparator;

@Service
public class GoogleImageService {

    private final WebClient webClient;
    private final GoogleConfig googleConfig;

    public GoogleImageService(GoogleConfig googleConfig) {
        this.googleConfig = googleConfig;
        this.webClient = WebClient.builder()
                .baseUrl("https://www.googleapis.com/customsearch/v1")
                .build();
    }

    @PostConstruct
    public void init() {
        System.out.println("🚀 [GOOGLE-IMG] === Service Initialization ===");
        googleConfig.logConfiguration();
        System.out.println("🚀 [GOOGLE-IMG] Google API Key configured: " + (googleConfig.getKey() != null && !googleConfig.getKey().isEmpty()));
        System.out.println("🚀 [GOOGLE-IMG] Google CX configured: " + (googleConfig.getCx() != null && !googleConfig.getCx().isEmpty()));
        if (googleConfig.getKey() != null && !googleConfig.getKey().isEmpty()) {
            System.out.println("🚀 [GOOGLE-IMG] API Key starts with: " + googleConfig.getKey().substring(0, Math.min(10, googleConfig.getKey().length())) + "...");
        } else {
            System.out.println("🚀 [GOOGLE-IMG] API Key is null or empty");
        }
        if (googleConfig.getCx() != null && !googleConfig.getCx().isEmpty()) {
            System.out.println("🚀 [GOOGLE-IMG] CX value: " + googleConfig.getCx());
        } else {
            System.out.println("🚀 [GOOGLE-IMG] CX is null or empty");
        }
        System.out.println("🚀 [GOOGLE-IMG] === End Initialization ===");
    }

    public Mono<GoogleImageResult> searchImages(String query) {
        // Detailed logging for Google API credentials debugging
        System.out.println("🔍 [GOOGLE-IMG] === Google API Configuration Debug ===");
        System.out.println("🔍 [GOOGLE-IMG] Query: " + query);
        System.out.println("🔍 [GOOGLE-IMG] API Key present: " + (googleConfig.getKey() != null));
        System.out.println("🔍 [GOOGLE-IMG] API Key length: " + (googleConfig.getKey() != null ? googleConfig.getKey().length() : 0));
        System.out.println("🔍 [GOOGLE-IMG] API Key starts with: " + (googleConfig.getKey() != null && googleConfig.getKey().length() > 10 ? googleConfig.getKey().substring(0, 10) + "..." : "null"));
        System.out.println("🔍 [GOOGLE-IMG] CX present: " + (googleConfig.getCx() != null));
        System.out.println("🔍 [GOOGLE-IMG] CX length: " + (googleConfig.getCx() != null ? googleConfig.getCx().length() : 0));
        System.out.println("🔍 [GOOGLE-IMG] CX value: " + (googleConfig.getCx() != null ? googleConfig.getCx() : "null"));
        System.out.println("🔍 [GOOGLE-IMG] === End Debug ===");
        
        // Check if Google API credentials are configured
        if (googleConfig.getKey() == null || googleConfig.getKey().isEmpty() ||
            googleConfig.getCx() == null || googleConfig.getCx().isEmpty()) {
            System.out.println("❌ [GOOGLE-IMG] API credentials not configured, skipping image search for: " + query);
            if (googleConfig.getKey() == null || googleConfig.getKey().isEmpty()) {
                System.out.println("❌ [GOOGLE-IMG] Missing or empty API Key");
            }
            if (googleConfig.getCx() == null || googleConfig.getCx().isEmpty()) {
                System.out.println("❌ [GOOGLE-IMG] Missing or empty Search Engine CX");
            }
            return Mono.empty();
        }

        System.out.println("🔍 [GOOGLE-IMG] Searching images for: " + query);
        return webClient.get()
                .uri(uriBuilder ->
                        uriBuilder
                                .queryParam("key", googleConfig.getKey())
                                .queryParam("cx", googleConfig.getCx())
                                .queryParam("searchType", "image")
                                .queryParam("num", 5)
                                .queryParam("q", query)
                                .build()
                )
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(GoogleSearchResponse.class)
                .map(resp -> {
                    System.out.println("✅ [GOOGLE-IMG] Successfully found images for: " + query);
                    return resp.items().stream()
                            .map(item -> new GoogleImageResult(item.title(), item.link()))
                            .max(Comparator.comparingInt(image -> score(query, image)))
                            .orElse(null);
                })
                .onErrorResume(error -> {
                    System.err.println("❌ [GOOGLE-IMG] Error searching images for: " + query);
                    System.err.println("❌ [GOOGLE-IMG] Error: " + error.getMessage());
                    return Mono.empty();
                });
    }

    private int score(String query, GoogleImageResult image) {
        String lowerTitle = image.title().toLowerCase();
        String[] queryWords = query.toLowerCase().split("\\s+");
        int score = 0;

        for (String word : queryWords) {
            if (lowerTitle.contains(word)) {
                score += 10;
            }
        }

        if (lowerTitle.contains("banner")) score -= 10;
        if (lowerTitle.contains("hirdetés") || lowerTitle.contains("promo")) score -= 5;
        if (lowerTitle.contains("100ml")) score += 3;
        if (lowerTitle.contains("szuszpenzió")) score += 3;

        return score;
    }
}
