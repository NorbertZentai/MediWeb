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
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

    @Value("${medication.sync.discovery-delay-ms:1000}")
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
        return fetchAllMedicationIds(null, null, null);
    }

    public LinkedHashSet<Long> fetchAllMedicationIds(BiConsumer<Integer, Integer> progressCallback) {
        return fetchAllMedicationIds(progressCallback, null, null);
    }

    public LinkedHashSet<Long> fetchAllMedicationIds(BiConsumer<Integer, Integer> progressCallback, Integer limit) {
        return fetchAllMedicationIds(progressCallback, limit, null);
    }

    public LinkedHashSet<Long> fetchAllMedicationIds(BiConsumer<Integer, Integer> progressCallback,
                                                     Integer limit,
                                                     Set<Long> knownExistingIds) {
        try {
            Map<String, String> sessionData = OgyeiRequestHelper.fetchSessionAndCsrfToken();
            String phpsessid = sessionData.get("PHPSESSID");
            String csrft = sessionData.get("csrft");

            LinkedHashSet<Long> identifiers = new LinkedHashSet<>();
            int effectiveLimit = (limit != null && limit > 0) ? limit : -1;
            boolean limitReached = false;
            int discoveredNewCount = 0;
            Set<Long> knownIds = knownExistingIds != null ? knownExistingIds : Collections.emptySet();
            boolean knownIdsEmpty = knownIds.isEmpty();
            MedicationSearchRequest request = MedicationSearchRequest.builder().build();

            int maxOffset = MAX_FULL_SCAN_PAGES * PAGE_SIZE;
            int currentOffset = 0;
            boolean morePages = true;
            ExecutorService executor = Executors.newFixedThreadPool(Math.max(1, discoveryParallelism));

            try {
                while (morePages && currentOffset < maxOffset && !limitReached) {
                    int chunkEnd = Math.min(currentOffset + DISCOVERY_CHUNK_SIZE, maxOffset);
                    int chunkAdded = 0;
                    boolean chunkFoundLastPage = false;
                    log.debug("OGYEI discovery chunk start offset {}", currentOffset);

                    int submittedTasks = 0;
                    ExecutorCompletionService<PageFetchResult> completionService = new ExecutorCompletionService<>(executor);
                    for (int offset = currentOffset; offset < chunkEnd; offset += PAGE_SIZE) {
                        if (effectiveLimit > 0 && discoveredNewCount >= effectiveLimit) {
                            limitReached = true;
                            break;
                        }
                        final int pageOffset = offset;
                        final int pageNumber = (offset / PAGE_SIZE) + 1;
                        completionService.submit(() -> fetchIdsForPage(request, csrft, phpsessid, pageOffset, pageNumber));
                        submittedTasks++;
                    }

                    int processedTasks = 0;
                    while (processedTasks < submittedTasks) {
                        Future<PageFetchResult> future;
                        try {
                            future = completionService.take();
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Az OGYEI azonosítókeresést megszakították", ie);
                        }
                        processedTasks++;

                        PageFetchResult result = getPageFetchResult(future);
                        if (result == null) {
                            continue;
                        }

                        if (limitReached) {
                            continue;
                        }

                        if (!result.ids().isEmpty()) {
                            int before = identifiers.size();
                            int newlyAdded = 0;
                            int processedWithinPage = 0;
                            for (Long id : result.ids()) {
                                if (limitReached) {
                                    break;
                                }
                                processedWithinPage++;
                                boolean added = identifiers.add(id);
                                if (added && (knownIdsEmpty || !knownIds.contains(id))) {
                                    newlyAdded++;
                                    discoveredNewCount++;
                                    if (effectiveLimit > 0 && discoveredNewCount >= effectiveLimit) {
                                        limitReached = true;
                                    }
                                }
                            }
                            int scannedDelta = processedWithinPage;
                            int diff = Math.max(0, identifiers.size() - before);
                            if (diff > 0) {
                                chunkAdded += diff;
                            }
                            if (progressCallback != null && (scannedDelta > 0 || newlyAdded > 0)) {
                                try {
                                    progressCallback.accept(scannedDelta, newlyAdded);
                                } catch (RuntimeException callbackEx) {
                                    log.debug("OGYEI progress callback threw exception", callbackEx);
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

                    if (limitReached) {
                        log.info("OGYEI discovery stopped early after reaching the requested new-item limit ({})", effectiveLimit);
                        morePages = false;
                    }

                    currentOffset += DISCOVERY_CHUNK_SIZE;

                    if (morePages && !limitReached) {
                        applyDiscoveryDelay();
                    }
                }
            } finally {
                shutdownExecutor(executor);
            }

            if (effectiveLimit > 0) {
                enforceNewLimit(identifiers, knownIds, effectiveLimit);
            }

            return identifiers;
        } catch (IOException e) {
            throw new RuntimeException("Nem sikerült lekérni az OGYEI azonosítókat", e);
        }
    }

    private void enforceNewLimit(LinkedHashSet<Long> identifiers, Set<Long> knownIds, int newLimit) {
        if (newLimit <= 0 || identifiers.isEmpty()) {
            return;
        }
        Set<Long> existing = knownIds != null ? knownIds : Collections.emptySet();
        int newCount = 0;
        LinkedHashSet<Long> limited = new LinkedHashSet<>(identifiers.size());
        for (Long id : identifiers) {
            boolean isKnown = existing.contains(id);
            if (!isKnown) {
                if (newCount >= newLimit) {
                    continue;
                }
                newCount++;
            }
            limited.add(id);
        }
        if (limited.size() != identifiers.size()) {
            identifiers.clear();
            identifiers.addAll(limited);
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
