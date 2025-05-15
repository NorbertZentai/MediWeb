package hu.project.MediTrack.modules.GoogleImage.util;

import hu.project.MediTrack.modules.GoogleImage.dto.GoogleImageItem;
import hu.project.MediTrack.modules.GoogleImage.dto.GoogleSearchResponse;

import java.util.*;

public class GoogleImageScorer {

    private static final List<String> NEGATIVE_KEYWORDS = List.of("banner", "promo", "landing_page", "advert");

    public int score(GoogleImageItem item, List<String> keywords) {
        String title = item.title().toLowerCase();
        int score = 0;

        for (String keyword : keywords) {
            if (title.contains(keyword)) {
                score += 5;
            }
        }

        for (String negative : NEGATIVE_KEYWORDS) {
            if (title.contains(negative)) {
                score -= 10;
            }
        }

        return score;
    }

    public GoogleImageItem findBestMatch(GoogleSearchResponse response, String medicationName) {
        List<String> keywords = extractKeywords(medicationName);
        return response.items().stream()
                .max(Comparator.comparingInt(item -> score(item, keywords)))
                .orElse(null);
    }

    private List<String> extractKeywords(String name) {
        return Arrays.stream(name.toLowerCase().split("[\\s,/\\-]+"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
