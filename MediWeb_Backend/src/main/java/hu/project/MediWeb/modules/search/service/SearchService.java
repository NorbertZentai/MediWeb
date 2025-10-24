package hu.project.MediWeb.modules.search.service;

import hu.project.MediWeb.modules.search.dto.MedicationSearchRequest;
import hu.project.MediWeb.modules.search.dto.MedicationSearchResult;
import hu.project.MediWeb.modules.search.util.MedicationParser;
import hu.project.MediWeb.modules.search.util.OgyeiRequestHelper;
import hu.project.MediWeb.modules.search.util.SearchUrlBuilder;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.IntConsumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service
@Slf4j
public class SearchService {

    private static final int MAX_RESULTS = 100;
    private static final int PAGE_SIZE = 20;
    private static final int MAX_FULL_SCAN_PAGES = 1200; // ~24k items safeguard
    private static final int DISCOVERY_CHUNK_SIZE = 1000;
    private static final Pattern ITEM_ID_PATTERN = Pattern.compile("item=(\\d+)");

    @Value("${medication.sync.discovery-delay-ms:800}")
    private long discoveryDelayMs;

    @Value("${medication.sync.discovery-retry-attempts:5}")
    private int discoveryRetryAttempts;

    @Value("${medication.sync.discovery-parallelism:8}")
    private int discoveryParallelism;

    public List<MedicationSearchResult> searchMedications(MedicationSearchRequest params) {
        try {
            Map<String, String> sessionData = OgyeiRequestHelper.fetchSessionAndCsrfToken();
            String phpsessid = sessionData.get("PHPSESSID");
            String csrft = sessionData.get("csrft");

            List<MedicationSearchResult> allResults = new ArrayList<>();

            for (int offset = 0; offset < MAX_RESULTS; offset += PAGE_SIZE) {
                String url = SearchUrlBuilder.buildSearchUrl(csrft, params, offset);
                Document doc = OgyeiRequestHelper.fetchSearchResultPage(url, phpsessid);

                Elements rows = doc.select("div.table__line.line");
                if (rows.isEmpty()) break;

                for (Element row : rows) {
                    Optional<MedicationSearchResult> result = MedicationParser.parseRow(row);
                    result.ifPresent(allResults::add);

                    if (allResults.size() >= MAX_RESULTS) {
                        return allResults;
                    }
                }
            }

            return allResults;

        } catch (IOException e) {
            throw new RuntimeException("Nem sikerült lekérni az adatokat", e);
        }
    }

    public LinkedHashSet<Long> fetchAllMedicationIds() {
        return fetchAllMedicationIds(null);
    }

    public LinkedHashSet<Long> fetchAllMedicationIds(IntConsumer progressCallback) {
        try {
            Map<String, String> sessionData = OgyeiRequestHelper.fetchSessionAndCsrfToken();
            String phpsessid = sessionData.get("PHPSESSID");
            String csrft = sessionData.get("csrft");

            LinkedHashSet<Long> identifiers = new LinkedHashSet<>();
            MedicationSearchRequest request = MedicationSearchRequest.builder().build();

            int maxOffset = MAX_FULL_SCAN_PAGES * PAGE_SIZE;
            int currentOffset = 0;
            boolean morePages = true;
            ExecutorService executor = Executors.newFixedThreadPool(Math.max(1, discoveryParallelism));

            try {
                while (morePages && currentOffset < maxOffset) {
                    int chunkEnd = Math.min(currentOffset + DISCOVERY_CHUNK_SIZE, maxOffset);
                    int chunkAdded = 0;
                    boolean chunkFoundLastPage = false;
                    log.debug("OGYEI discovery chunk start offset {}", currentOffset);

                    int submittedTasks = 0;
                    ExecutorCompletionService<PageFetchResult> completionService = new ExecutorCompletionService<>(executor);
                    for (int offset = currentOffset; offset < chunkEnd; offset += PAGE_SIZE) {
                        final int pageOffset = offset;
                        final int pageNumber = (offset / PAGE_SIZE) + 1;
                        completionService.submit(() -> fetchIdsForPage(request, csrft, phpsessid, pageOffset, pageNumber));
                        submittedTasks++;
                    }

                    for (int i = 0; i < submittedTasks; i++) {
                        Future<PageFetchResult> future;
                        try {
                            future = completionService.take();
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Az OGYEI azonosítókeresést megszakították", ie);
                        }

                        PageFetchResult result = getPageFetchResult(future);
                        if (result == null) {
                            continue;
                        }

                        if (!result.ids().isEmpty()) {
                            int before = identifiers.size();
                            for (Long id : result.ids()) {
                                identifiers.add(id);
                            }
                            int diff = identifiers.size() - before;
                            if (diff > 0) {
                                chunkAdded += diff;
                                if (progressCallback != null) {
                                    try {
                                        progressCallback.accept(diff);
                                    } catch (RuntimeException callbackEx) {
                                        log.debug("OGYEI progress callback threw exception", callbackEx);
                                    }
                                }
                            }
                        }

                        if (result.lastPage()) {
                            chunkFoundLastPage = true;
                        }
                    }

                    if (chunkFoundLastPage) {
                        log.info("OGYEI full scan detected final page within chunk starting at offset {}", currentOffset);
                        morePages = false;
                    } else if (chunkAdded <= 0) {
                        log.debug("OGYEI discovery chunk yielded no new ids at offset {}", currentOffset);
                        morePages = false;
                    }

                    currentOffset += DISCOVERY_CHUNK_SIZE;

                    if (morePages) {
                        applyDiscoveryDelay();
                    }
                }
            } finally {
                shutdownExecutor(executor);
            }

            return identifiers;
        } catch (IOException e) {
            throw new RuntimeException("Nem sikerült lekérni az OGYEI azonosítókat", e);
        }
    }

    private Document fetchPageWithRetry(String url, String phpsessid, int pageNumber) throws IOException {
        int attempts = Math.max(discoveryRetryAttempts, 0) + 1;
        IOException lastException = null;

        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                if (attempt > 1) {
                    log.warn("Retrying OGYEI page fetch (page={}, attempt={}/{})", pageNumber, attempt, attempts);
                }
                return OgyeiRequestHelper.fetchSearchResultPage(url, phpsessid);
            } catch (IOException ex) {
                lastException = ex;
                if (attempt >= attempts) {
                    break;
                }
                applyRetryBackoff(attempt);
            }
        }

        throw lastException != null ? lastException : new IOException("Ismeretlen hiba a(z) " + pageNumber + ". oldal lekérésekor.");
    }

    private void applyDiscoveryDelay() {
        if (discoveryDelayMs <= 0) {
            return;
        }
        sleepQuietly(discoveryDelayMs);
    }

    private void applyRetryBackoff(int attempt) {
        long baseDelay = discoveryDelayMs > 0 ? discoveryDelayMs : 500L;
        long backoff = Math.min(baseDelay * Math.max(1, attempt), Duration.ofSeconds(10).toMillis());
        sleepQuietly(backoff);
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(Math.max(0L, millis));
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private PageFetchResult fetchIdsForPage(MedicationSearchRequest request,
                                            String csrft,
                                            String phpsessid,
                                            int offset,
                                            int pageNumber) {
        try {
            String url = SearchUrlBuilder.buildSearchUrl(csrft, request, offset);
            Document doc = fetchPageWithRetry(url, phpsessid, pageNumber);
            Elements rows = doc.select("div.table__line.line");

            if (rows.isEmpty()) {
                log.debug("OGYEI page {} returned empty response", pageNumber);
                return new PageFetchResult(List.of(), true);
            }

            List<Long> ids = new ArrayList<>(rows.size());
            for (Element row : rows) {
                Optional<MedicationSearchResult> result = MedicationParser.parseRow(row);
                result.map(MedicationSearchResult::getLink)
                        .flatMap(this::extractItemId)
                        .ifPresent(ids::add);
            }

            boolean lastPage = rows.size() < PAGE_SIZE;
            return new PageFetchResult(ids, lastPage);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    private PageFetchResult getPageFetchResult(Future<PageFetchResult> future) throws IOException {
        try {
            return future.get();
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new IOException("Az OGYEI lekérés megszakadt", ie);
        } catch (ExecutionException ee) {
            Throwable cause = ee.getCause();
            if (cause instanceof RuntimeException runtime && runtime.getCause() instanceof IOException io) {
                throw io;
            }
            if (cause instanceof IOException io) {
                throw io;
            }
            if (cause instanceof RuntimeException runtime) {
                throw runtime;
            }
            throw new RuntimeException("Ismeretlen hiba az OGYEI oldal feldolgozása közben", cause);
        }
    }

    private void shutdownExecutor(ExecutorService executor) {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(30, java.util.concurrent.TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException ie) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    private record PageFetchResult(List<Long> ids, boolean lastPage) {}

    private Optional<Long> extractItemId(String link) {
        if (link == null || link.isBlank()) {
            return Optional.empty();
        }
        Matcher matcher = ITEM_ID_PATTERN.matcher(link);
        if (!matcher.find()) {
            return Optional.empty();
        }
        try {
            return Optional.of(Long.parseLong(matcher.group(1)));
        } catch (NumberFormatException ex) {
            log.debug("Unable to parse medication id from link: {}", link, ex);
            return Optional.empty();
        }
    }
}
