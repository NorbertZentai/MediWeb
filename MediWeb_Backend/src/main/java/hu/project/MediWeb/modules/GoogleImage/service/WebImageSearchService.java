package hu.project.MediWeb.modules.GoogleImage.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Semaphore;

/**
 * Free, unlimited image search via Bing Image scraping.
 * Replaces Google Custom Search API as the primary image source.
 */
@Service
@Slf4j
public class WebImageSearchService {

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    private static final List<String> TRUSTED_DOMAINS = List.of(
            "hazipatika.com", "patika24.hu", "benu.hu",
            "pharmaclub.hu", "vatera.hu", "ogyei.gov.hu",
            "gyogyszertarat.hu", "gyogyszertar.hu",
            "egeszsegkalauz.hu", "webbeteg.hu"
    );

    private static final List<String> MED_URL_KEYWORDS = List.of(
            "patika", "gyogyszer", "pharma", "medicina",
            "egeszseg", "tablet", "kapszula"
    );

    private static final List<String> STOCK_SITES = List.of(
            "shutterstock", "istockphoto", "gettyimages",
            "dreamstime", "depositphotos", "123rf",
            "stock.adobe", "freepik", "pixabay"
    );

    private static final List<String> NEGATIVE_TITLE_KEYWORDS = List.of(
            "banner", "hirdetés", "promo", "logo", "icon",
            "vector", "illusztráció", "stock photo", "clip art"
    );

    private static final List<String> FORM_KEYWORDS = List.of(
            "tabletta", "kapszula", "filmtabletta", "mg",
            "doboz", "csomag", "gyógyszer"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Semaphore semaphore;

    public WebImageSearchService(
            @Value("${medication.sync.image-concurrency:5}") int imageConcurrency) {
        this.semaphore = new Semaphore(imageConcurrency, true);
    }

    /**
     * Search for a medication image via Bing Images scraping.
     * Returns the best matching image URL, or null if none found.
     */
    public String searchImage(String medicationName) {
        if (medicationName == null || medicationName.isBlank()) {
            return null;
        }

        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }

        try {
            // Attempt 1: Full cleaned name
            String result = doSearch(medicationName, false);
            if (result != null) {
                return result;
            }

            // Attempt 2 (Fallback): Only the first word (brand name)
            Thread.sleep(1500L);
            log.debug("[WEB-IMAGE] Attempt 1 failed for '{}', trying fallback (brand only)", medicationName);
            result = doSearch(medicationName, true);
            return result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } finally {
            semaphore.release();
        }
    }

    private String doSearch(String medicationName, boolean useBrandNameOnly) {
        try {
            String cleanedName = cleanMedicationName(medicationName);
            
            if (useBrandNameOnly) {
                String[] words = cleanedName.split(" ");
                if (words.length > 0 && words[0].length() > 2) {
                    cleanedName = words[0];
                }
            }

            String query = cleanedName + " gyógyszer doboz";
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String searchUrl = "https://www.bing.com/images/search?q=" + encodedQuery + "&form=HDRSC2&first=1";

            Document doc = Jsoup.connect(searchUrl)
                    .userAgent(USER_AGENT)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7")
                    .timeout(15000)
                    .get();

            List<ImageCandidate> candidates = extractImageCandidates(doc);
            if (candidates.isEmpty()) {
                log.debug("[WEB-IMAGE] No candidates found for: {} (cleaned: {}, brandOnly: {})", 
                    medicationName, cleanedName, useBrandNameOnly);
                return null;
            }

            final String finalCleanedName = cleanedName;
            return candidates.stream()
                    .filter(c -> score(finalCleanedName, c) > 10) // Threshold enforcement!
                    .max(Comparator.comparingInt(c -> score(finalCleanedName, c)))
                    .map(c -> c.imageUrl)
                    .orElse(null);
        } catch (Exception e) {
            log.debug("[WEB-IMAGE] Search failed for '{}': {}", medicationName, e.getMessage());
            return null;
        }
    }

    private String cleanMedicationName(String name) {
        if (name == null) return "";
        // Remove dosage (e.g., 500 mg, 10mg, 1,5 g, 5%, 50NE)
        String cleaned = name.replaceAll("(?i)\\d+([.,]\\d+)?\\s*(mg|g|mcg|ml|l|ne|iu|unit|egység|százalék|%)\\b", "");
        // Remove pack size (e.g., 20x, 30 db, 1x)
        cleaned = cleaned.replaceAll("(?i)\\d+\\s*(x|db|darab|ampulla|fecskendő)\\b", "");
        // Remove medicinal forms and types
        cleaned = cleaned.replaceAll("(?i)\\b(retard|filmtabletta|tabletta|kapszula|belsőleges|szuszpenzió|injekció|krém|kenőcs|oldat|kúp|szirup|cseppek|por|granulátum|lágy|kemény|bevont|gyomornedv-ellenálló|pezsgőtabletta|szopogató|szájnyálkahártyán|alkalmazott|hatóanyag-leadású|gél|spray|hab|hüvelykúp|infúzió|szemcsepp|fülcsepp|orrspray|tapasz|folyadék|emulzió)\\b", "");
        // Remove punctuation and extra spaces
        cleaned = cleaned.replaceAll("[\\p{Punct}]", " ");
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        // Fallback to original if we stripped too much
        return cleaned.length() < 3 ? name : cleaned;
    }

    private List<ImageCandidate> extractImageCandidates(Document doc) {
        List<ImageCandidate> candidates = new ArrayList<>();

        // Method 1: Parse 'm' attribute from <a class="iusc"> elements (Bing's standard format)
        Elements iuscLinks = doc.select("a.iusc");
        for (Element link : iuscLinks) {
            String mAttr = link.attr("m");
            if (mAttr != null && !mAttr.isEmpty()) {
                try {
                    JsonNode node = objectMapper.readTree(mAttr);
                    String murl = node.has("murl") ? node.get("murl").asText() : null;
                    String title = node.has("t") ? node.get("t").asText() : "";
                    String domain = node.has("purl") ? node.get("purl").asText() : "";
                    if (murl != null && !murl.isEmpty()) {
                        candidates.add(new ImageCandidate(murl, title, domain));
                    }
                } catch (Exception ignored) {
                    // Skip malformed JSON
                }
            }
            if (candidates.size() >= 10) break;
        }

        // Method 2: Fallback — parse img tags with data-src
        if (candidates.isEmpty()) {
            Elements imgs = doc.select("img.mimg[data-src]");
            for (Element img : imgs) {
                String src = img.attr("data-src");
                String alt = img.attr("alt");
                if (src != null && !src.isEmpty() && src.startsWith("http")) {
                    candidates.add(new ImageCandidate(src, alt != null ? alt : "", ""));
                }
                if (candidates.size() >= 10) break;
            }
        }

        return candidates;
    }

    private int score(String query, ImageCandidate candidate) {
        String lowerTitle = candidate.title.toLowerCase();
        String lowerUrl = candidate.imageUrl.toLowerCase();
        String lowerDomain = candidate.domain.toLowerCase();
        String[] queryWords = query.toLowerCase().split("\\s+");
        int score = 0;

        // Title match
        for (String word : queryWords) {
            if (word.length() >= 3 && lowerTitle.contains(word)) {
                score += 15; // Increased weight
            }
        }

        // Exact name match bonus
        if (lowerTitle.contains(query.toLowerCase())) {
            score += 40;
        }

        // Trusted pharmacy domains
        for (String domain : TRUSTED_DOMAINS) {
            if (lowerDomain.contains(domain) || lowerUrl.contains(domain)) {
                score += 50; // Doubled weight
                break;
            }
        }

        // Medication URL keywords
        for (String kw : MED_URL_KEYWORDS) {
            if (lowerUrl.contains(kw) || lowerDomain.contains(kw)) {
                score += 15; // Increased weight
                break;
            }
        }

        // Stock photo penalty
        for (String stock : STOCK_SITES) {
            if (lowerUrl.contains(stock) || lowerDomain.contains(stock)) {
                score -= 100; // Drastic penalty
                break;
            }
        }

        // Negative title keywords
        for (String neg : NEGATIVE_TITLE_KEYWORDS) {
            if (lowerTitle.contains(neg)) {
                score -= 50; // Increased penalty
                break;
            }
        }

        // Form keywords bonus
        for (String form : FORM_KEYWORDS) {
            if (lowerTitle.contains(form)) {
                score += 10; // Increased weight
                break;
            }
        }

        // File extension bonus (PNG/JPG preferred over generic)
        if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || lowerUrl.endsWith(".png")) {
            score += 5;
        }

        return score;
    }

    private record ImageCandidate(String imageUrl, String title, String domain) {}
}
