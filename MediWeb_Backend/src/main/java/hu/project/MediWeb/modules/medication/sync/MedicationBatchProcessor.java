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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
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
        int effectiveLimit = resolveDiscoveryLimit(limitOverride);
        Object limitLabel = effectiveLimit > 0 ? effectiveLimit : "unbounded";
        log.info("Medication sync started (forceResync={}, limit={})", forceResync, limitLabel);
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
            LinkedHashSet<Long> discoveredIds = searchService.fetchAllMedicationIds((scannedDelta, newDelta) -> {
                statusTracker.incrementDiscovery(scannedDelta, newDelta);
            }, effectiveLimit > 0 ? effectiveLimit : null, existingIds);
            if (discoveredIds.isEmpty()) {
                throw new IllegalStateException("Az OGYEI teljes lista üres eredményt adott vissza");
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
                    processItem(currentId, null, succeededIds, failedIds, preparedMedications, reviewOnlyIds, persistedCountHolder);
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
                        processItem(currentId, null, succeededIds, failedIds, preparedMedications, reviewOnlyIds, persistedCountHolder);
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
                    processItem(currentId, finalExisting, succeededIds, failedIds, preparedMedications, reviewOnlyIds, persistedCountHolder);
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
                    log.warn("Megszakítás után {} gyógyszer és {} felülvizsgálati jelölés vár újrapróbálkozásra", pendingSnapshotCount, pendingReviewCount);
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
                        forceResync
                );
                return;
            }

            boolean allItemsSkipped = failureMessage == null && succeededIds.isEmpty() && failedIds.isEmpty() && !skippedIds.isEmpty();
            if (allItemsSkipped && !forceResync) {
                String autoMessage = "Minden tétel kihagyva a " + skipRecentDays + " napos frissítési ablak miatt, erőltetett újraindítás indul.";
                log.warn("Medication sync finished without processed items ({} skipped). Restarting in force mode.", skippedIds.size());
                statusTracker.markFinished(autoMessage);
                writeSyncSummaryLog(
                        processedIds,
                        new ArrayList<>(succeededIds),
                        new ArrayList<>(failedIds),
                        new ArrayList<>(skippedIds),
                        latestPersistedCount,
                        false,
                        autoMessage,
                        forceResync
                );
                Integer nextLimit = effectiveLimit > 0 ? effectiveLimit : null;
                refreshAllMedications(true, nextLimit);
                return;
            }

            if (allItemsSkipped && forceResync) {
                failureMessage = "Minden tétel kihagyva még erőltetett módban is. Ellenőrizd a szűrési beállításokat.";
                log.warn("Medication sync skipped every item even in force mode. {} skipped entries.", skippedIds.size());
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
                log.warn("Szinkron lezárult, de {} gyógyszer és {} felülvizsgálati jelölés ismételt mentésre vár", pendingSnapshotCount, pendingReviewCount);
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
                    forceResync
            );
            statusTracker.updatePersistedCount(latestPersistedCount);
        }
    }

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
            MedicationService.MedicationRefreshResult result = fetchSnapshotWithRetry(itemId, existing);
            if (isCancellationRequested() || Thread.currentThread().isInterrupted()) {
                return;
            }
            if (result == null) {
                failedIds.add(itemId);
                statusTracker.incrementProcessed(false, "Sikertelen feldolgozás: " + itemId);
                return;
            }

            boolean hasChanges = medicationService.hasMeaningfulChanges(existing, result.response());
            if (hasChanges) {
                preparedMedications.add(result.entity());
            } else {
                reviewOnlyIds.add(itemId);
            }

            succeededIds.add(itemId);
            statusTracker.incrementProcessed(true, hasChanges ? null : "Nincs változás: " + itemId);
        } catch (CancellationException cancelEx) {
            log.debug("Gyógyszer feldolgozás megszakítva ({}): {}", itemId, cancelEx.getMessage());
        } catch (Exception taskEx) {
            failedIds.add(itemId);
            statusTracker.incrementProcessed(false, "Váratlan hiba: " + taskEx.getMessage());
            log.error("Váratlan hiba a {} azonosító feldolgozása közben", itemId, taskEx);
        } finally {
            maybeFlushProgress(preparedMedications, reviewOnlyIds, false, persistedCountHolder);
            sleep(delayBetweenRequestsMs);
        }
    }

    private MedicationService.MedicationRefreshResult fetchSnapshotWithRetry(Long itemId, Medication existing) throws Exception {
        Exception lastException = null;
        for (int attempt = 0; attempt <= retryAttempts; attempt++) {
            if (isCancellationRequested() || Thread.currentThread().isInterrupted()) {
                throw new CancellationException("Szinkron leállítása folyamatban");
            }
            try {
                return medicationService.refreshMedicationSnapshot(itemId, existing);
            } catch (Exception ex) {
                lastException = ex;
                log.warn("Nem sikerült feldolgozni az {} azonosítót ({} / {})", itemId, attempt + 1, retryAttempts + 1, ex);
                sleep(delayBetweenRequestsMs * Math.max(1, attempt + 1));
            }
        }
        if (lastException != null) {
            throw lastException;
        }
        return null;
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
        if ((preparedMedications.isEmpty() && reviewOnlyIds.isEmpty()) && !force) {
            return;
        }

        int threshold = Math.max(persistenceChunkSize, 1);
        List<List<Medication>> snapshotBatches = new ArrayList<>();
        List<Set<Long>> reviewBatches = new ArrayList<>();

        synchronized (persistenceLock) {
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
                log.warn("A részleges mentés sikertelen volt, és a csomag már kisebb nem bontható ({} elem)", batch.size());
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
                log.warn("A felülvizsgált tételek frissítése sikertelen, és a csomag már kisebb nem bontható ({} elem)", batch.size());
                return new LinkedHashSet<>(batch);
            }

            log.warn("Felülvizsgálati dátum frissítése sikertelen – újrapróbálkozás kisebb, {} elemű csomagokkal", fallbackSize);
            Set<Long> failed = new LinkedHashSet<>();
            List<Long> ids = new ArrayList<>(batch);
            for (int start = 0; start < ids.size(); start += fallbackSize) {
                Set<Long> chunk = new LinkedHashSet<>(ids.subList(start, Math.min(start + fallbackSize, ids.size())));
                try {
                    medicationService.updateLastReviewed(chunk);
                } catch (Exception chunkEx) {
                    log.error("Nem sikerült a felülvizsgált gyógyszerek fallback mentése ({} tétel)", chunk.size(), chunkEx);
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
                log.error("Nem sikerült a(z) {} azonosítójú gyógyszer mentése egyedi próbálkozás után sem", medication.getId(), ex);
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
                log.error("Nem sikerült a(z) {} azonosítójú gyógyszer felülvizsgálati jelölése egyedi próbálkozás után sem", id, ex);
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
            log.debug("Részleges mentés megerősítve ({} tétel, mód: {}) – tárolt összesen: {}", attempted, channel, persistedCount);
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
            long estimatedRemainingSeconds = Math.max(0L, Math.round(Math.max(totalKnownItems - processedIds.size(), 0) * effectiveSeconds));

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
