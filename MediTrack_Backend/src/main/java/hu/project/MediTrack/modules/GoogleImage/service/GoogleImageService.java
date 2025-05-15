package hu.project.MediTrack.modules.GoogleImage.service;

import hu.project.MediTrack.modules.GoogleImage.config.GoogleConfig;
import hu.project.MediTrack.modules.GoogleImage.dto.GoogleImageResult;
import hu.project.MediTrack.modules.GoogleImage.dto.GoogleSearchResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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

    public Mono<GoogleImageResult> searchImages(String query) {
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
                .map(resp -> resp.items().stream()
                        .map(item -> new GoogleImageResult(item.title(), item.link()))
                        .max(Comparator.comparingInt(image -> score(query, image)))
                        .orElse(null)
                );
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
