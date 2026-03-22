package hu.project.MediWeb.modules.medication.sync;

import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.service.MedicationService;
import hu.project.MediWeb.modules.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicationBatchProcessor {

    private final SearchService searchService;
    private final MedicationService medicationService;
    private final MedicationSyncStatusTracker statusTracker;
    private final AtomicBoolean cancellationRequested = new AtomicBoolean(false);
    private final Object persistenceLock = new Object();

    @Value("${medication.sync.delay-ms:1500}")
    private long delayBetweenRequestsMs;

    @Value("${medication.sync.retry-attempts:2}")
    private int retryAttempts;

    @Value("${medication.sync.parallelism:4}")
    private int parallelism;

    @Value("${medication.sync.skip-recent-days:7}")
    private int skipRecentDays;

    @Value("${medication.sync.average-seconds-per-item:10}")
    private double averageSecondsPerItem;

    @Value("${medication.sync.total-known-items:15504}")
    private int totalKnownItems;

    @Value("${medication.sync.discovery-limit:-1}")
    private int configuredDiscoveryLimit;

    @Value("${medication.sync.persistence-chunk-size:500}")
    private int persistenceChunkSize;

    @Value("${medication.sync.persistence-fallback-chunk-size:100}")
    private int persistenceFallbackChunkSize;

    public boolean requestStop() {
        if (!statusTracker.isRunning()) {
            return false;
        }
        boolean accepted = statusTracker.requestCancellation("Manuális leállítás folyamatban...");
        if (accepted) {
            cancellationRequested.set(true);
        }
        return accepted;
    }

    private boolean isCancellationRequested() {
        return cancellationRequested.get();
    }

    public void refreshAllMedications() {
        refreshAllMedications(false, null);
    }

    public void refreshAllMedications(boolean forceResync) {
        refreshAllMedications(forceResync, null);
    }

    public void refreshAllMedications(boolean forceResync, Integer limitOverride) {
        processBatch(forceResync, limitOverride, false);
    }

    public void refreshMissingImages() {
        refreshLocalImages(false, false);
    }

    public void refreshMissingImages(boolean force) {
        refreshLocalImages(force, false);
    }

    public void refreshMissingImages(boolean force, boolean cleanup) {
        refreshLocalImages(force, cleanup);
    }

    /**
     * Iterates over medications in our local DB that have no image (or all active meds if force=true),
     * and fetches images from web search / Google API only (no OGYEI scraping).
     * If cleanup=true, first validates existing image URLs and clears broken ones.
     *
     * Runs as a SINGLE continuous operation with two phases:
     * Phase 1 (IMAGE_CLEANUP): validate existing URLs via HEAD requests, clear broken ones
     * Phase 2 (IMAGE_FETCH): fetch images for medications without images
     * One markStarted at the beginning (from controller), one markFinished at the end.
     */
    private void refreshLocalImages(boolean force, boolean cleanup) {
        log.info("🖼️ [IMAGE-SYNC] Starting local image sync (force={}, cleanup={}) — scanning local DB", force, cleanup);
        cancellationRequested.set(false);

        int cleaned = 0;

        // Phase 1: optionally validate & clear broken image URLs
        if (cleanup && !force) {
            // Transition to IMAGE_CLEANUP phase — 10 threads, ~0.5s per URL check
            statusTracker.transitionToPhase("IMAGE_CLEANUP", 0, 10, 0.5, "Kép URL-ek ellenőrzése indul...");

            try {
                cleaned = medicationService.cleanupBrokenImageUrls(progress -> {
                    int checked = progress[0];
                    int total = progress[1];
                    int broken = progress[2];
                    if (checked == 0 && total > 0) {
                        // Initial callback — now we know the total, update the phase
                        statusTracker.transitionToPhase("IMAGE_CLEANUP", total, 10, 0.5,
                                String.format("Kép URL-ek ellenőrzése: 0 / %d", total));
                    } else {
                        statusTracker.updateProgress(checked, checked - broken, broken,
                                String.format("Kép URL-ek ellenőrzése: %d / %d (hibás: %d)", checked, total, broken));
                    }
                });

                if (cleaned > 0) {
                    log.info("🖼️ [IMAGE-SYNC] Cleanup cleared {} broken image URLs", cleaned);
                } else {
                    log.info("🖼️ [IMAGE-SYNC] Cleanup found no broken URLs");
                }
            } catch (Exception e) {
                log.error("🖼️ [IMAGE-SYNC] Cleanup failed: {}", e.getMessage(), e);
            }

            if (isCancellationRequested()) {
                statusTracker.markCancelled("Képszinkron megszakítva", medicationService.countStoredMedications());
                return;
            }
        }

        // Phase 2: fetch missing images
        List<Medication> medications = force
                ? medicationService.findAllActiveMedicationsWithName()
                : medicationService.findMedicationsWithoutImage();
        int total = medications.size();

        if (total == 0) {
            log.info("✅ [IMAGE-SYNC] No medications to process — nothing to do");
            String msg = cleanup && cleaned > 0
                    ? String.format("%d hibás kép URL törölve. Minden gyógyszerhez van már kép.", cleaned)
                    : force
                            ? "Nincs aktív gyógyszer az adatbázisban"
                            : "Minden gyógyszerhez van már kép";
            statusTracker.markFinished(msg);
            return;
        }

        log.info("🖼️ [IMAGE-SYNC] Found {} medications to process in local DB", total);

        // Transition to IMAGE_FETCH phase — 2 threads, ~2s per image search
        int imageThreads = Math.max(1, Math.min(parallelism, 2));
        statusTracker.transitionToPhase("IMAGE_FETCH", total, imageThreads, 2.0,
                String.format("Hiányzó képek keresése: 0 / %d", total));

        ExecutorService executor = Executors.newFixedThreadPool(imageThreads);
        List<Future<?>> futures = new ArrayList<>();
        AtomicInteger fetched = new AtomicInteger(0);
        AtomicInteger skippedCount = new AtomicInteger(0);
        AtomicInteger failedCount = new AtomicInteger(0);

        log.info("🖼️ [IMAGE-SYNC] Using {} threads for image sync", imageThreads);

        try {
            for (Medication med : medications) {
                if (isCancellationRequested()) {
                    break;
                }
                futures.add(executor.submit(() -> {
                    if (isCancellationRequested() || Thread.currentThread().isInterrupted()) {
                        return;
                    }
                    try {
                        boolean found = medicationService.fetchImageForMedication(med, force);
                        if (found) {
                            fetched.incrementAndGet();
                            statusTracker.incrementImageFetched();
                            statusTracker.incrementProcessed(true, "Kép mentve: " + med.getName());
                        } else {
                            skippedCount.incrementAndGet();
                            statusTracker.incrementImageSkipped();
                            statusTracker.incrementProcessed(true, "Nincs kép: " + med.getName());
                        }
                    } catch (Exception ex) {
                        failedCount.incrementAndGet();
                        statusTracker.incrementProcessed(false, "Hiba: " + med.getName() + " — " + ex.getMessage());
                        log.error("❌ [IMAGE-SYNC] Unexpected error for medication id={}: {} [{}]",
                                med.getId(), ex.getMessage(), ex.getClass().getName(), ex);
                    } finally {
                        sleep(1500); // throttle to avoid Bing rate limiting
                    }
                }));
            }
        } finally {
            if (isCancellationRequested()) {
                cancelFutures(futures);
            }
            waitForFutures(futures);
            shutdownExecutor(executor);

            String summary;
            if (cleanup && cleaned > 0) {
                summary = String.format(
                        "Képszinkron kész — hibás URL törölve: %d, keresve: %d, képet találtunk: %d, nem találtunk: %d, hiba: %d",
                        cleaned, total, fetched.get(), skippedCount.get(), failedCount.get());
            } else {
                summary = String.format(
                        "Képszinkron kész — összesen: %d, képet találtunk: %d, nem találtunk: %d, hiba: %d",
                        total, fetched.get(), skippedCount.get(), failedCount.get());
            }
            log.info("🖼️ [IMAGE-SYNC] {}", summary);

            if (isCancellationRequested()) {
                statusTracker.markCancelled("Képszinkron manuálisan leállítva", medicationService.countStoredMedications());
            } else {
                statusTracker.markFinished(summary);
            }
        }
    }

    private void processBatch(boolean forceResync, Integer limitOverride, boolean onlyMissingImages) {
        int effectiveLimit = resolveDiscoveryLimit(limitOverride);
        Object limitLabel = effectiveLimit > 0 ? effectiveLimit : "unbounded";
        log.info("Medication batch processing started (forceResync={}, limit={}, onlyMissingImages={})",
                forceResync, limitLabel, onlyMissingImages);
        cancellationRequested.set(false);
        int persistedBeforeSync;
        try {
            persistedBeforeSync = medicationService.countStoredMedications();
        } catch (Exception ex) {
            log.warn("Nem sikerült lekérdezni az induló gyógyszerszámot", ex);
            persistedBeforeSync = 0;
        }
        int latestPersistedCount = persistedBeforeSync;
        int initialTotal = effectiveLimit > 0 ? effectiveLimit : 0;
        statusTracker.markStarted(initialTotal, averageSecondsPerItem, parallelism, persistedBeforeSync);
        Set<Long> processedIds = Collections.synchronizedSet(new LinkedHashSet<>());
        List<Long> skippedIds = new ArrayList<>();
        List<Long> succeededIds = Collections.synchronizedList(new ArrayList<>());
        List<Long> failedIds = Collections.synchronizedList(new ArrayList<>());
        List<Medication> preparedMedications = Collections.synchronizedList(new ArrayList<>());
        Set<Long> reviewOnlyIds = Collections.newSetFromMap(new ConcurrentHashMap<>());
        ExecutorService executor = Executors.newFixedThreadPool(Math.max(1, parallelism));
        List<Future<?>> futures = new ArrayList<>();
        boolean completed = false;
        String failureMessage = null;
        boolean cancelled = false;
        AtomicInteger persistedCountHolder = new AtomicInteger(latestPersistedCount);

        try {
            Set<Long> existingIds = medicationService.fetchExistingMedicationIds();
            LinkedHashSet<Long> discoveredIds;

            if (onlyMissingImages) {
                Set<Long> missingImageIds = medicationService.findIdsWithoutImage();
                discoveredIds = new LinkedHashSet<>(missingImageIds);
                if (effectiveLimit > 0 && discoveredIds.size() > effectiveLimit) {
                    // Truncate if limit is set (though usually not used for this mode)
                    List<Long> limited = new ArrayList<>(discoveredIds).subList(0, effectiveLimit);
                    discoveredIds = new LinkedHashSet<>(limited);
                }
                statusTracker.incrementDiscovery(0, discoveredIds.size());
            } else {
                discoveredIds = searchService.fetchAllMedicationIds((scannedDelta, newDelta) -> {
                    statusTracker.incrementDiscovery(scannedDelta, newDelta);
                }, effectiveLimit > 0 ? effectiveLimit : null, existingIds);
            }

            if (discoveredIds.isEmpty()) {
                if (onlyMissingImages) {
                    throw new IllegalStateException("Nincs olyan gyógyszer, aminek hiányzik a képe");
                } else {
                    throw new IllegalStateException("Az OGYEI teljes lista üres eredményt adott vissza");
                }
            }

            statusTracker.markDiscoveryComplete(discoveredIds.size());
            this.totalKnownItems = discoveredIds.size();
            processedIds.addAll(discoveredIds);

            if (isCancellationRequested()) {
                throw new CancellationException("Szinkron megszakítva a feldolgozás előtt");
            }

            List<Long> newIds = new ArrayList<>();
            List<Long> existingToReview = new ArrayList<>();

            for (Long id : discoveredIds) {
                if (existingIds.contains(id)) {
                    existingToReview.add(id);
                } else {
                    newIds.add(id);
                }
            }

            log.info("OGYEI scan összesen {} azonosítót talált ({} új, {} meglévő)",
                    discoveredIds.size(), newIds.size(), existingToReview.size());

            for (Long itemId : newIds) {
                if (isCancellationRequested()) {
                    throw new CancellationException("Szinkron megszakítva manuális leállítás miatt");
                }
                final Long currentId = itemId;
                futures.add(executor.submit(() -> {
                    processItem(currentId, null, succeededIds, failedIds, preparedMedications, reviewOnlyIds,
                            persistedCountHolder);
                    return null;
                }));
            }

            for (Long itemId : existingToReview) {
                if (isCancellationRequested()) {
                    throw new CancellationException("Szinkron megszakítva manuális leállítás miatt");
                }
                final Long currentId = itemId;
                Medication existing = medicationService.findMedicationById(currentId).orElse(null);
                if (existing == null) {
                    futures.add(executor.submit(() -> {
                        processItem(currentId, null, succeededIds, failedIds, preparedMedications, reviewOnlyIds,
                                persistedCountHolder);
                        return null;
                    }));
                    continue;
                }

                if (shouldSkipItem(currentId, existing, forceResync)) {
                    skippedIds.add(currentId);
                    statusTracker.incrementSkipped("Kihagyva friss medikáció: " + currentId);
                    continue;
                }

                Medication finalExisting = existing;
                futures.add(executor.submit(() -> {
                    processItem(currentId, finalExisting, succeededIds, failedIds, preparedMedications, reviewOnlyIds,
                            persistedCountHolder);
                    return null;
                }));
            }
        } catch (CancellationException cancelEx) {
            cancelled = true;
            failureMessage = cancelEx.getMessage();
            log.info("Medication sync cancellation acknowledged: {}", failureMessage);
        } catch (Exception ex) {
            failureMessage = ex.getMessage() != null ? ex.getMessage() : ex.toString();
            log.error("Hiba a batch szinkronizáció során", ex);
        } finally {
            if (isCancellationRequested()) {
                cancelFutures(futures);
            }
            waitForFutures(futures);
            shutdownExecutor(executor);

            maybeFlushProgress(preparedMedications, reviewOnlyIds, true, persistedCountHolder);

            int pendingSnapshotCount;
            int pendingReviewCount;
            synchronized (persistenceLock) {
                pendingSnapshotCount = preparedMedications.size();
                pendingReviewCount = reviewOnlyIds.size();
            }

            if (cancelled || isCancellationRequested()) {
                if (pendingSnapshotCount > 0 || pendingReviewCount > 0) {
                    log.warn("Megszakítás után {} gyógyszer és {} felülvizsgálati jelölés vár újrapróbálkozásra",
                            pendingSnapshotCount, pendingReviewCount);
                }

                int persistedAfterCancel;
                try {
                    persistedAfterCancel = medicationService.countStoredMedications();
                } catch (Exception countEx) {
                    log.debug("Nem sikerült leállítás után frissíteni a tárolt gyógyszerek számát", countEx);
                    persistedAfterCancel = persistedCountHolder.get();
                }
                latestPersistedCount = persistedAfterCancel;
                statusTracker.updatePersistedCount(latestPersistedCount);
                String cancelMessage = failureMessage != null && !failureMessage.isBlank()
                        ? failureMessage
                        : "Szinkron manuálisan leállítva";
                statusTracker.markCancelled(cancelMessage, latestPersistedCount);
                writeSyncSummaryLog(
                        processedIds,
                        new ArrayList<>(succeededIds),
                        new ArrayList<>(failedIds),
                        new ArrayList<>(skippedIds),
                        latestPersistedCount,
                        false,
                        cancelMessage,
                        forceResync);
                return;
            }

            boolean allItemsSkipped = failureMessage == null && succeededIds.isEmpty() && failedIds.isEmpty()
                    && !skippedIds.isEmpty();
            if (allItemsSkipped && !forceResync) {
                String autoMessage = "Minden tétel kihagyva a " + skipRecentDays
                        + " napos frissítési ablak miatt, erőltetett újraindítás indul.";
                log.warn("Medication sync finished without processed items ({} skipped). Restarting in force mode.",
                        skippedIds.size());
                statusTracker.markFinished(autoMessage);
                writeSyncSummaryLog(
                        processedIds,
                        new ArrayList<>(succeededIds),
                        new ArrayList<>(failedIds),
                        new ArrayList<>(skippedIds),
                        latestPersistedCount,
                        false,
                        autoMessage,
                        forceResync);
                Integer nextLimit = effectiveLimit > 0 ? effectiveLimit : null;
                refreshAllMedications(true, nextLimit);
                return;
            }

            if (allItemsSkipped && forceResync) {
                failureMessage = "Minden tétel kihagyva még erőltetett módban is. Ellenőrizd a szűrési beállításokat.";
                log.warn("Medication sync skipped every item even in force mode. {} skipped entries.",
                        skippedIds.size());
            }

            if ((pendingSnapshotCount > 0 || pendingReviewCount > 0) && failureMessage == null) {
                failureMessage = "Nem sikerült minden módosítást adatbázisba menteni (függőben: "
                        + pendingSnapshotCount + " gyógyszer, " + pendingReviewCount + " felülvizsgálat)";
            }

            if (failureMessage == null) {
                statusTracker.markFinished("Szinkronizáció befejezve");
                completed = true;
            } else {
                statusTracker.markFinished("Szinkronizáció hibával zárult: " + failureMessage);
            }

            if (pendingSnapshotCount > 0 || pendingReviewCount > 0) {
                log.warn("Szinkron lezárult, de {} gyógyszer és {} felülvizsgálati jelölés ismételt mentésre vár",
                        pendingSnapshotCount, pendingReviewCount);
            }
            if (completed) {
                medicationService.updateActiveStatuses(new HashSet<>(processedIds));
            }

            try {
                latestPersistedCount = medicationService.countStoredMedications();
            } catch (Exception countEx) {
                log.debug("Nem sikerült frissíteni a tárolt gyógyszerek számát", countEx);
                latestPersistedCount = persistedCountHolder.get();
            }

            writeSyncSummaryLog(
                    processedIds,
                    new ArrayList<>(succeededIds),
                    new ArrayList<>(failedIds),
                    new ArrayList<>(skippedIds),
                    latestPersistedCount,
                    completed,
                    failureMessage,
                    forceResync);
            statusTracker.updatePersistedCount(latestPersistedCount);
        }
    }

    /**
     * Async processItem: uses CompletableFuture-based OGYÉI scraping.
     * Phase 1: Fast OGYÉI-only scrape for all items.
     * Phase 2: If changes detected or new item → also fetches Hazipatika + images.
     */
    private void processItem(Long itemId,
            Medication existing,
            List<Long> succeededIds,
            List<Long> failedIds,
            List<Medication> preparedMedications,
            Set<Long> reviewOnlyIds,
            AtomicInteger persistedCountHolder) {
        if (isCancellationRequested() || Thread.currentThread().isInterrupted()) {
            return;
        }
        try {
            // Phase 1: fast OGYÉI-only scrape (uses async HTTP client with Semaphore)
            MedicationService.MedicationRefreshResult result;
            boolean isNew = (existing == null);
            boolean needsEnrichment;

            if (isNew) {
                // New medication — do full scrape (OGYÉI + Hazipatika + image)
                var response = medicationService.scrapeFullAsync(itemId, null).join();
                result = new MedicationService.MedicationRefreshResult(
                        buildEntityFromResponse(itemId, response, null), response);
                needsEnrichment = false; // already enriched
            } else {
                // Existing — fast OGYÉI-only scrape first
                var ogyeiResponse = medicationService.scrapeOgyeiOnlyAsync(itemId).join();
                boolean hasChanges = medicationService.hasMeaningfulChanges(existing, ogyeiResponse);
                boolean needsImage = !org.springframework.util.StringUtils.hasText(existing.getImageUrl());

                if (hasChanges || needsImage) {
                    // Phase 2: enrich with Hazipatika + image
                    var fullResponse = medicationService.scrapeFullAsync(itemId, existing).join();
                    result = new MedicationService.MedicationRefreshResult(
                            buildEntityFromResponse(itemId, fullResponse, existing), fullResponse);
                    needsEnrichment = false;
                } else {
                    // No changes, no missing image — just mark as reviewed
                    reviewOnlyIds.add(itemId);
                    succeededIds.add(itemId);
                    statusTracker.incrementProcessed(true, "Nincs változás: " + itemId);
                    maybeFlushProgress(preparedMedications, reviewOnlyIds, false, persistedCountHolder);
                    return;
                }
            }

            if (isCancellationRequested() || Thread.currentThread().isInterrupted()) {
                return;
            }
            if (result == null) {
                failedIds.add(itemId);
                statusTracker.incrementProcessed(false, "Sikertelen feldolgozás: " + itemId);
                return;
            }

            preparedMedications.add(result.entity());
            succeededIds.add(itemId);
            statusTracker.incrementProcessed(true, null);
        } catch (CancellationException cancelEx) {
            log.debug("Gyógyszer feldolgozás megszakítva ({}): {}", itemId, cancelEx.getMessage());
        } catch (CompletionException completionEx) {
            Throwable cause = completionEx.getCause() != null ? completionEx.getCause() : completionEx;
            failedIds.add(itemId);
            statusTracker.incrementProcessed(false, "Hiba: " + cause.getMessage());
            log.error("Hiba a {} azonosító feldolgozása közben", itemId, cause);
        } catch (Exception taskEx) {
            failedIds.add(itemId);
            statusTracker.incrementProcessed(false, "Hiba: " + taskEx.getMessage());
            log.error("Hiba a {} azonosító feldolgozása közben", itemId, taskEx);
        } finally {
            maybeFlushProgress(preparedMedications, reviewOnlyIds, false, persistedCountHolder);
        }
    }

    private Medication buildEntityFromResponse(Long itemId,
            hu.project.MediWeb.modules.medication.dto.MedicationDetailsResponse response,
            Medication existing) {
        Medication entity = hu.project.MediWeb.modules.medication.dto.MedicationDetailsMapper.toEntity(itemId, response);
        entity.setLastUpdated(java.time.LocalDateTime.now());
        entity.setLastReviewedAt(java.time.LocalDateTime.now());
        if (existing != null && !org.springframework.util.StringUtils.hasText(entity.getImageUrl())) {
            entity.setImageUrl(existing.getImageUrl());
        }
        entity.setActive(response.isActive());
        return entity;
    }

    private boolean shouldSkipItem(Long itemId, Medication existing, boolean forceResync) {
        if (forceResync) {
            return false;
        }
        if (skipRecentDays <= 0) {
            return false;
        }
        if (existing == null) {
            return false;
        }

        Duration window = Duration.ofDays(skipRecentDays);
        boolean recent = medicationService.wasReviewedWithin(existing, window);
        if (recent) {
            log.debug("Skipping medication {} because it was reviewed within {} days", itemId, skipRecentDays);
        }
        return recent;
    }

    private void sleep(long millis) {
        if (millis <= 0) {
            return;
        }
        try {
            Thread.sleep(Math.min(millis, Duration.ofSeconds(10).toMillis()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void maybeFlushProgress(List<Medication> preparedMedications,
            Set<Long> reviewOnlyIds,
            boolean force,
            AtomicInteger persistedCountHolder) {
        int threshold = Math.max(persistenceChunkSize, 1);
        List<List<Medication>> snapshotBatches = new ArrayList<>();
        List<Set<Long>> reviewBatches = new ArrayList<>();

        synchronized (persistenceLock) {
            if ((preparedMedications.isEmpty() && reviewOnlyIds.isEmpty()) && !force) {
                return;
            }
            if (force) {
                if (!preparedMedications.isEmpty()) {
                    snapshotBatches.add(new ArrayList<>(preparedMedications));
                    preparedMedications.clear();
                }
                if (!reviewOnlyIds.isEmpty()) {
                    reviewBatches.add(new LinkedHashSet<>(reviewOnlyIds));
                    reviewOnlyIds.clear();
                }
            } else {
                while (preparedMedications.size() >= threshold) {
                    List<Medication> batch = new ArrayList<>(preparedMedications.subList(0, threshold));
                    preparedMedications.subList(0, threshold).clear();
                    snapshotBatches.add(batch);
                }
                if (reviewOnlyIds.size() >= threshold) {
                    Set<Long> batch = new LinkedHashSet<>();
                    Iterator<Long> iterator = reviewOnlyIds.iterator();
                    while (iterator.hasNext() && batch.size() < threshold) {
                        Long id = iterator.next();
                        batch.add(id);
                        iterator.remove();
                    }
                    reviewBatches.add(batch);
                }
            }
        }

        for (List<Medication> batch : snapshotBatches) {
            List<Medication> failed = tryPersistSnapshots(batch, persistedCountHolder);
            if (!failed.isEmpty()) {
                synchronized (persistenceLock) {
                    preparedMedications.addAll(0, failed);
                }
            }
        }

        for (Set<Long> batch : reviewBatches) {
            Set<Long> failed = tryUpdateReviewFlags(batch);
            if (!failed.isEmpty()) {
                synchronized (persistenceLock) {
                    reviewOnlyIds.addAll(failed);
                }
            }
        }
    }

    private List<Medication> tryPersistSnapshots(List<Medication> batch, AtomicInteger persistedCountHolder) {
        if (batch == null || batch.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            medicationService.saveMedicationsBulk(batch);
            verifyPartialPersistence(persistedCountHolder, batch.size(), "bulk");
            return Collections.emptyList();
        } catch (Exception ex) {
            log.error("Nem sikerült a gyógyszeradatok részleges mentése ({} tétel)", batch.size(), ex);
            int fallbackSize = Math.max(persistenceFallbackChunkSize, 1);
            if (batch.size() <= fallbackSize) {
                log.warn("A részleges mentés sikertelen volt, és a csomag már kisebb nem bontható ({} elem)",
                        batch.size());
                return new ArrayList<>(batch);
            }

            log.warn("Részleges mentés sikertelen – újrapróbálkozás kisebb, {} elemű csomagokkal", fallbackSize);
            List<Medication> failed = new ArrayList<>();
            for (int start = 0; start < batch.size(); start += fallbackSize) {
                int end = Math.min(start + fallbackSize, batch.size());
                List<Medication> chunk = new ArrayList<>(batch.subList(start, end));
                try {
                    medicationService.saveMedicationsBulk(chunk);
                    verifyPartialPersistence(persistedCountHolder, chunk.size(), "fallback");
                } catch (Exception chunkEx) {
                    log.error("Nem sikerült a gyógyszeradatok fallback mentése ({} tétel)", chunk.size(), chunkEx);
                    failed.addAll(persistSnapshotsIndividually(chunk, persistedCountHolder));
                }
            }
            return failed;
        }
    }

    private Set<Long> tryUpdateReviewFlags(Set<Long> batch) {
        if (batch == null || batch.isEmpty()) {
            return Collections.emptySet();
        }

        try {
            medicationService.updateLastReviewed(batch);
            return Collections.emptySet();
        } catch (Exception ex) {
            log.error("Nem sikerült a felülvizsgált gyógyszerek részleges mentése ({} tétel)", batch.size(), ex);
            int fallbackSize = Math.max(persistenceFallbackChunkSize, 1);
            if (batch.size() <= fallbackSize) {
                log.warn("A felülvizsgált tételek frissítése sikertelen, és a csomag már kisebb nem bontható ({} elem)",
                        batch.size());
                return new LinkedHashSet<>(batch);
            }

            log.warn("Felülvizsgálati dátum frissítése sikertelen – újrapróbálkozás kisebb, {} elemű csomagokkal",
                    fallbackSize);
            Set<Long> failed = new LinkedHashSet<>();
            List<Long> ids = new ArrayList<>(batch);
            for (int start = 0; start < ids.size(); start += fallbackSize) {
                Set<Long> chunk = new LinkedHashSet<>(ids.subList(start, Math.min(start + fallbackSize, ids.size())));
                try {
                    medicationService.updateLastReviewed(chunk);
                } catch (Exception chunkEx) {
                    log.error("Nem sikerült a felülvizsgált gyógyszerek fallback mentése ({} tétel)", chunk.size(),
                            chunkEx);
                    failed.addAll(updateReviewFlagsIndividually(chunk));
                }
            }
            return failed;
        }
    }

    private List<Medication> persistSnapshotsIndividually(List<Medication> items, AtomicInteger persistedCountHolder) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }
        List<Medication> failed = new ArrayList<>();
        for (Medication medication : items) {
            try {
                medicationService.saveMedicationsBulk(Collections.singletonList(medication));
                verifyPartialPersistence(persistedCountHolder, 1, "single");
            } catch (Exception ex) {
                log.error("Nem sikerült a(z) {} azonosítójú gyógyszer mentése egyedi próbálkozás után sem",
                        medication.getId(), ex);
                failed.add(medication);
            }
        }
        return failed;
    }

    private Set<Long> updateReviewFlagsIndividually(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptySet();
        }
        Set<Long> failed = new LinkedHashSet<>();
        for (Long id : ids) {
            try {
                medicationService.updateLastReviewed(Collections.singleton(id));
            } catch (Exception ex) {
                log.error(
                        "Nem sikerült a(z) {} azonosítójú gyógyszer felülvizsgálati jelölése egyedi próbálkozás után sem",
                        id, ex);
                failed.add(id);
            }
        }
        return failed;
    }

    private void verifyPartialPersistence(AtomicInteger persistedCountHolder, int attempted, String channel) {
        try {
            int persistedCount = medicationService.countStoredMedications();
            persistedCountHolder.set(persistedCount);
            statusTracker.updatePersistedCount(persistedCount);
            log.debug("Részleges mentés megerősítve ({} tétel, mód: {}) – tárolt összesen: {}", attempted, channel,
                    persistedCount);
        } catch (Exception countEx) {
            log.warn("Nem sikerült ellenőrizni a részleges mentést ({} tétel, mód: {})", attempted, channel, countEx);
        }
    }

    private void writeSyncSummaryLog(Set<Long> processedIds,
            List<Long> succeededIds,
            List<Long> failedIds,
            List<Long> skippedIds,
            int totalPersisted,
            boolean completed,
            String failureMessage,
            boolean forceResync) {
        try {
            java.nio.file.Path logDir = java.nio.file.Paths.get("logs");
            java.nio.file.Files.createDirectories(logDir);

            String timestamp = java.time.OffsetDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            java.nio.file.Path logFile = logDir.resolve("medication-sync-" + timestamp + ".log");

            java.util.List<String> lines = new java.util.ArrayList<>();
            lines.add("Sikeres tételek (" + succeededIds.size() + "):");
            if (succeededIds.isEmpty()) {
                lines.add("- nincs sikeres feldolgozás");
            } else {
                succeededIds.stream()
                        .sorted()
                        .forEach(id -> lines.add("- " + id));
            }

            lines.add("");
            lines.add("Kihagyott tételek (" + skippedIds.size() + "):");
            if (skippedIds.isEmpty()) {
                lines.add("- nincs kihagyott feldolgozás");
            } else {
                skippedIds.stream()
                        .sorted()
                        .forEach(id -> lines.add("- " + id));
            }

            lines.add("");
            lines.add("Sikertelen tételek (" + failedIds.size() + "):");
            if (failedIds.isEmpty()) {
                lines.add("- nincs sikertelen feldolgozás");
            } else {
                failedIds.stream()
                        .sorted()
                        .forEach(id -> lines.add("- " + id));
            }

            lines.add("");
            lines.add("Összegzés");
            lines.add("- Feldolgozott összesen: " + processedIds.size());
            lines.add("- Sikeres: " + succeededIds.size());
            lines.add("- Kihagyott: " + skippedIds.size());
            lines.add("- Sikertelen: " + failedIds.size());
            lines.add("- Összes OGYEI tétel: " + Math.max(totalKnownItems, 0));
            lines.add("- Adatbázisban tárolt gyógyszerek: " + Math.max(totalPersisted, 0));

            double baselineSeconds = averageSecondsPerItem > 0 ? averageSecondsPerItem : 10.0d;
            double effectiveSeconds = baselineSeconds / Math.max(parallelism, 1);
            long estimatedTotalSeconds = Math.max(0L, Math.round(Math.max(totalKnownItems, 0) * effectiveSeconds));
            long estimatedRemainingSeconds = Math.max(0L,
                    Math.round(Math.max(totalKnownItems - processedIds.size(), 0) * effectiveSeconds));

            lines.add("- Becsült teljes idő: " + formatDuration(estimatedTotalSeconds));
            lines.add("- Becsült hátralévő idő: " + formatDuration(estimatedRemainingSeconds));
            lines.add("- Állapot: " + (completed ? "Sikeresen befejezett" : "Hibával lezárult"));
            lines.add("- Kényszerített frissítés: " + (forceResync ? "igen" : "nem"));
            if (failureMessage != null && !failureMessage.isBlank()) {
                lines.add("- Hibaüzenet: " + failureMessage);
            }

            java.nio.file.Files.write(logFile, lines, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception logEx) {
            log.error("Nem sikerült a szinkron összegző napló mentése", logEx);
        }
    }

    private String formatDuration(long totalSeconds) {
        if (totalSeconds <= 0) {
            return "0 másodperc";
        }
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;

        List<String> parts = new ArrayList<>();
        if (hours > 0) {
            parts.add(hours + " óra");
        }
        if (minutes > 0) {
            parts.add(minutes + " perc");
        }
        if (seconds > 0 || parts.isEmpty()) {
            parts.add(seconds + " mp");
        }
        return String.join(" ", parts);
    }

    private void waitForFutures(List<Future<?>> futures) {
        for (Future<?> future : futures) {
            if (future == null) {
                continue;
            }
            if (isCancellationRequested() && !future.isDone()) {
                future.cancel(true);
                continue;
            }
            try {
                future.get();
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            } catch (ExecutionException ee) {
                log.error("Váratlan hiba a párhuzamos feldolgozás során", ee.getCause());
            }
        }
    }

    private void shutdownExecutor(ExecutorService executor) {
        if (executor == null) {
            return;
        }
        if (isCancellationRequested()) {
            executor.shutdownNow();
        } else {
            executor.shutdown();
        }
        try {
            if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException ie) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    private void cancelFutures(List<Future<?>> futures) {
        for (Future<?> future : futures) {
            if (future != null && !future.isDone()) {
                future.cancel(true);
            }
        }
    }

    private int resolveDiscoveryLimit(Integer limitOverride) {
        if (limitOverride != null && limitOverride > 0) {
            return limitOverride;
        }
        if (configuredDiscoveryLimit > 0) {
            return configuredDiscoveryLimit;
        }
        return -1;
    }
}
