package hu.project.MediWeb.modules.GoogleImage.service;

import hu.project.MediWeb.modules.GoogleImage.config.GoogleConfig;
import hu.project.MediWeb.modules.GoogleImage.dto.GoogleImageResult;
import hu.project.MediWeb.modules.GoogleImage.dto.GoogleSearchResponse;
import jakarta.annotation.PostConstruct;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class GoogleImageService {

    private static final long MIN_DELAY_MS = 1000L;
    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(45);

    private final WebClient webClient;
    private final GoogleConfig googleConfig;
    private final ReentrantLock rateLimitLock = new ReentrantLock();
    private final ReentrantLock quotaLock = new ReentrantLock();
    private final Semaphore inFlightSemaphore = new Semaphore(1, true);
    private volatile long lastRequestAtMs = 0L;
    private volatile long minuteWindowStartMs = 0L;
    private volatile int minuteRequestCount = 0;
    private volatile long dayWindowStartMs = 0L;
    private volatile int dayRequestCount = 0;

    public GoogleImageService(GoogleConfig googleConfig) {
        this.googleConfig = googleConfig;

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(DEFAULT_TIMEOUT)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler((int) DEFAULT_TIMEOUT.toSeconds()))
                        .addHandlerLast(new WriteTimeoutHandler((int) DEFAULT_TIMEOUT.toSeconds())));

        this.webClient = WebClient.builder()
                .baseUrl("https://www.googleapis.com/customsearch/v1")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
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

        String enhancedQuery = query + " gyógyszer doboz";
        System.out.println("🔍 [GOOGLE-IMG] Searching images for: " + enhancedQuery);
        return Mono.defer(() -> {
            final AtomicBoolean permitAcquired = new AtomicBoolean(false);
            try {
                inFlightSemaphore.acquire();
                permitAcquired.set(true);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                return Mono.empty();
            }

            if (!reserveQuota(query)) {
                if (permitAcquired.get()) {
                    inFlightSemaphore.release();
                }
                return Mono.empty();
            }

            enforceRateLimit();

            return webClient.get()
                .uri(uriBuilder ->
                        uriBuilder
                                .queryParam("key", googleConfig.getKey())
                                .queryParam("cx", googleConfig.getCx())
                                .queryParam("searchType", "image")
                                .queryParam("imgType", "photo")
                                .queryParam("lr", "lang_hu")
                                .queryParam("num", 10)
                                .queryParam("q", enhancedQuery)
                                .build()
                )
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(GoogleSearchResponse.class)
                .map(resp -> {
                    System.out.println("✅ [GOOGLE-IMG] Successfully found images for: " + enhancedQuery);
                    return resp.items().stream()
                            .map(item -> new GoogleImageResult(item.title(), item.link(), item.displayLink()))
                            .max(Comparator.comparingInt(image -> score(query, image)))
                            .orElse(null);
                })
                .onErrorResume(error -> {
                    System.err.println("❌ [GOOGLE-IMG] Error searching images for: " + query);
                    System.err.println("❌ [GOOGLE-IMG] Error: " + error.getMessage());
                    if (error instanceof WebClientResponseException tooManyRequests && tooManyRequests.getStatusCode().value() == 429) {
                        applyThrottleBackoff();
                    }
                    releaseQuotaOnFailure();
                    return Mono.empty();
                })
                .doFinally(signalType -> {
                    if (permitAcquired.get()) {
                        inFlightSemaphore.release();
                    }
                });
        });
    }

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

    private int score(String query, GoogleImageResult image) {
        String lowerTitle = (image.title() != null ? image.title() : "").toLowerCase();
        String lowerLink = (image.link() != null ? image.link() : "").toLowerCase();
        String lowerDisplayLink = (image.displayLink() != null ? image.displayLink() : "").toLowerCase();
        String[] queryWords = query.toLowerCase().split("\\s+");
        int score = 0;

        // 1. Cím egyezés — szavanként +10 (csak 3+ karakteres szavak)
        for (String word : queryWords) {
            if (word.length() >= 3 && lowerTitle.contains(word)) {
                score += 10;
            }
        }

        // 2. Megbízható magyar gyógyszeres domain-ek — +25
        for (String domain : TRUSTED_DOMAINS) {
            if (lowerDisplayLink.contains(domain) || lowerLink.contains(domain)) {
                score += 25;
                break;
            }
        }

        // 3. Gyógyszer-specifikus URL kulcsszavak — +8
        for (String kw : MED_URL_KEYWORDS) {
            if (lowerLink.contains(kw) || lowerDisplayLink.contains(kw)) {
                score += 8;
                break;
            }
        }

        // 4. Negatív — stock fotó oldalak — -30
        for (String stock : STOCK_SITES) {
            if (lowerLink.contains(stock) || lowerDisplayLink.contains(stock)) {
                score -= 30;
                break;
            }
        }

        // 5. Negatív — reklám / irreleváns cím tartalom — -10
        for (String neg : NEGATIVE_TITLE_KEYWORDS) {
            if (lowerTitle.contains(neg)) {
                score -= 10;
                break;
            }
        }

        // 6. Pozitív — gyógyszerforma kulcsszavak a címben — +5
        for (String form : FORM_KEYWORDS) {
            if (lowerTitle.contains(form)) {
                score += 5;
                break;
            }
        }

        return score;
    }

    private void enforceRateLimit() {
        long configuredDelay = Math.max(googleConfig.getRequestDelayMs(), 0L);
        long minDelay = Math.max(configuredDelay, MIN_DELAY_MS);
        if (minDelay <= 0) {
            return;
        }

        rateLimitLock.lock();
        try {
            long now = System.currentTimeMillis();
            long waitUntil = lastRequestAtMs + minDelay;
            if (waitUntil > now) {
                long sleepMs = waitUntil - now;
                try {
                    Thread.sleep(sleepMs);
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt();
                }
                now = System.currentTimeMillis();
            }
            lastRequestAtMs = now;
        } finally {
            rateLimitLock.unlock();
        }
    }

    private void applyThrottleBackoff() {
        long baseDelay = Math.max(googleConfig.getRequestDelayMs(), 0L);
        long backoff = Math.max(baseDelay * 4, 1000L);
        rateLimitLock.lock();
        try {
            lastRequestAtMs = System.currentTimeMillis() + backoff;
        } finally {
            rateLimitLock.unlock();
        }
        System.err.println("⏳ [GOOGLE-IMG] Too many requests detected, applying backoff of " + backoff + " ms");
    }

    private boolean reserveQuota(String query) {
        int perMinuteLimit = googleConfig.getMaxRequestsPerMinute();
        int perDayLimit = googleConfig.getMaxRequestsPerDay();
        long now = System.currentTimeMillis();

        quotaLock.lock();
        try {
            if (perMinuteLimit > 0) {
                long minuteWindow = Duration.ofMinutes(1).toMillis();
                if (now - minuteWindowStartMs >= minuteWindow) {
                    minuteWindowStartMs = now;
                    minuteRequestCount = 0;
                }
                if (minuteRequestCount >= perMinuteLimit) {
                    System.err.println("⏳ [GOOGLE-IMG] Per-minute kvóta elérve, kihagyjuk a keresést: " + query);
                    return false;
                }
            }

            if (perDayLimit > 0) {
                long dayWindow = Duration.ofDays(1).toMillis();
                if (now - dayWindowStartMs >= dayWindow) {
                    dayWindowStartMs = now;
                    dayRequestCount = 0;
                }
                if (dayRequestCount >= perDayLimit) {
                    System.err.println("⏳ [GOOGLE-IMG] Napi kvóta elérve, kihagyjuk a keresést: " + query);
                    return false;
                }
            }

            minuteRequestCount++;
            dayRequestCount++;
            return true;
        } finally {
            quotaLock.unlock();
        }
    }

    private void releaseQuotaOnFailure() {
        quotaLock.lock();
        try {
            if (minuteRequestCount > 0) {
                minuteRequestCount--;
            }
            if (dayRequestCount > 0) {
                dayRequestCount--;
            }
        } finally {
            quotaLock.unlock();
        }
    }
}
