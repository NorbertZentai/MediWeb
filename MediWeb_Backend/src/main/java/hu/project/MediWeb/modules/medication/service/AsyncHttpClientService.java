package hu.project.MediWeb.modules.medication.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class AsyncHttpClientService {

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    @Value("${medication.sync.max-concurrent-requests:30}")
    private int maxConcurrentRequests;

    @Value("${medication.sync.http-timeout-seconds:30}")
    private int httpTimeoutSeconds;

    private HttpClient httpClient;
    private Semaphore semaphore;

    private final AtomicInteger activeRequests = new AtomicInteger(0);
    private final AtomicLong throttleUntilMs = new AtomicLong(0);
    private final AtomicInteger consecutiveErrors = new AtomicInteger(0);

    @PostConstruct
    public void init() {
        this.semaphore = new Semaphore(maxConcurrentRequests, true);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        log.info("AsyncHttpClientService initialized: maxConcurrent={}, timeout={}s",
                maxConcurrentRequests, httpTimeoutSeconds);
    }

    public CompletableFuture<String> fetchAsync(String url) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                semaphore.acquire();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Megszakítva a semaphore várakozás közben", e);
            }

            activeRequests.incrementAndGet();
            try {
                applyAdaptiveThrottle();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(httpTimeoutSeconds))
                        .header("User-Agent", USER_AGENT)
                        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                        .header("Accept-Language", "hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7")
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 429) {
                    long backoffMs = Math.min(5000L * (consecutiveErrors.incrementAndGet()), 30000L);
                    throttleUntilMs.set(System.currentTimeMillis() + backoffMs);
                    log.warn("OGYÉI 429 Too Many Requests — backoff {}ms", backoffMs);
                    throw new RuntimeException("OGYÉI rate limit (429), backoff " + backoffMs + "ms");
                }

                if (response.statusCode() >= 400) {
                    throw new RuntimeException("OGYÉI HTTP " + response.statusCode() + " for " + url);
                }

                consecutiveErrors.set(0);
                return response.body();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("HTTP kérés megszakítva", e);
            } catch (java.io.IOException e) {
                consecutiveErrors.incrementAndGet();
                throw new RuntimeException("Hálózati hiba: " + url, e);
            } finally {
                activeRequests.decrementAndGet();
                semaphore.release();
            }
        });
    }

    public CompletableFuture<String> fetchWithRetry(String url, int maxRetries) {
        return fetchWithRetryInternal(url, maxRetries, 0);
    }

    private CompletableFuture<String> fetchWithRetryInternal(String url, int maxRetries, int attempt) {
        return fetchAsync(url).exceptionallyCompose(ex -> {
            if (Thread.currentThread().isInterrupted()) {
                return CompletableFuture.failedFuture(ex);
            }
            if (attempt >= maxRetries) {
                return CompletableFuture.failedFuture(ex);
            }
            long delay = Math.min(1000L * (attempt + 1), 5000L);
            log.debug("Retry {}/{} for {} after {}ms: {}", attempt + 1, maxRetries, url, delay, ex.getMessage());
            try {
                Thread.sleep(delay);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return CompletableFuture.failedFuture(ie);
            }
            return fetchWithRetryInternal(url, maxRetries, attempt + 1);
        });
    }

    private void applyAdaptiveThrottle() {
        long throttleEnd = throttleUntilMs.get();
        long now = System.currentTimeMillis();
        if (throttleEnd > now) {
            try {
                Thread.sleep(throttleEnd - now);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public int getActiveRequestCount() {
        return activeRequests.get();
    }
}
