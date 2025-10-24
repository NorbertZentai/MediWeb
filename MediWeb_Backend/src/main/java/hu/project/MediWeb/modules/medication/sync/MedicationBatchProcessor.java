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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicationBatchProcessor {

    private final SearchService searchService;
    private final MedicationService medicationService;
    private final MedicationSyncStatusTracker statusTracker;

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

    public void refreshAllMedications() {
        refreshAllMedications(false);
    }

    public void refreshAllMedications(boolean forceResync) {
        log.info("Medication sync started (forceResync={})", forceResync);
    statusTracker.markStarted(0, averageSecondsPerItem, parallelism);
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

        try {
            LinkedHashSet<Long> discoveredIds = searchService.fetchAllMedicationIds(added -> {
                if (added > 0) {
                    statusTracker.incrementDiscovered(added);
                }
            });
            if (discoveredIds.isEmpty()) {
                throw new IllegalStateException("Az OGYEI teljes lista üres eredményt adott vissza");
            }

            statusTracker.markDiscoveryComplete(discoveredIds.size());
            this.totalKnownItems = discoveredIds.size();
            processedIds.addAll(discoveredIds);

            Set<Long> existingIds = medicationService.fetchExistingMedicationIds();
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
                futures.add(executor.submit(() -> {
                    processItem(itemId, null, succeededIds, failedIds, preparedMedications, reviewOnlyIds);
                    return null;
                }));
            }

            for (Long itemId : existingToReview) {
                Medication existing = medicationService.findMedicationById(itemId).orElse(null);
                if (existing == null) {
                    futures.add(executor.submit(() -> {
                        processItem(itemId, null, succeededIds, failedIds, preparedMedications, reviewOnlyIds);
                        return null;
                    }));
                    continue;
                }

                if (shouldSkipItem(itemId, existing, forceResync)) {
                    skippedIds.add(itemId);
                    statusTracker.incrementSkipped("Kihagyva friss medikáció: " + itemId);
                    continue;
                }

                Medication finalExisting = existing;
                futures.add(executor.submit(() -> {
                    processItem(itemId, finalExisting, succeededIds, failedIds, preparedMedications, reviewOnlyIds);
                    return null;
                }));
            }
        } catch (Exception ex) {
            failureMessage = ex.getMessage() != null ? ex.getMessage() : ex.toString();
            log.error("Hiba a batch szinkronizáció során", ex);
        } finally {
            waitForFutures(futures);
            shutdownExecutor(executor);

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
                        false,
                        autoMessage,
                        forceResync
                );
                refreshAllMedications(true);
                return;
            }

            if (allItemsSkipped && forceResync) {
                failureMessage = "Minden tétel kihagyva még erőltetett módban is. Ellenőrizd a szűrési beállításokat.";
                log.warn("Medication sync skipped every item even in force mode. {} skipped entries.", skippedIds.size());
            }

            if (failureMessage == null) {
                statusTracker.markFinished("Szinkronizáció befejezve");
                completed = true;
            } else {
                statusTracker.markFinished("Szinkronizáció hibával zárult: " + failureMessage);
            }

            if (completed) {
                List<Medication> snapshotsToPersist = new ArrayList<>(preparedMedications);
                medicationService.saveMedicationsBulk(snapshotsToPersist);
                if (!reviewOnlyIds.isEmpty()) {
                    medicationService.updateLastReviewed(reviewOnlyIds);
                }
                medicationService.updateActiveStatuses(new HashSet<>(processedIds));
            }

            writeSyncSummaryLog(
                    processedIds,
                    new ArrayList<>(succeededIds),
                    new ArrayList<>(failedIds),
                    new ArrayList<>(skippedIds),
                    completed,
                    failureMessage,
                    forceResync
            );
        }
    }

    private void processItem(Long itemId,
                             Medication existing,
                             List<Long> succeededIds,
                             List<Long> failedIds,
                             List<Medication> preparedMedications,
                             Set<Long> reviewOnlyIds) {
        try {
            MedicationService.MedicationRefreshResult result = fetchSnapshotWithRetry(itemId, existing);
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
        } catch (Exception taskEx) {
            failedIds.add(itemId);
            statusTracker.incrementProcessed(false, "Váratlan hiba: " + taskEx.getMessage());
            log.error("Váratlan hiba a {} azonosító feldolgozása közben", itemId, taskEx);
        } finally {
            sleep(delayBetweenRequestsMs);
        }
    }

    private MedicationService.MedicationRefreshResult fetchSnapshotWithRetry(Long itemId, Medication existing) throws Exception {
        Exception lastException = null;
        for (int attempt = 0; attempt <= retryAttempts; attempt++) {
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

    private void writeSyncSummaryLog(Set<Long> processedIds,
                                     List<Long> succeededIds,
                                     List<Long> failedIds,
                                     List<Long> skippedIds,
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
        executor.shutdown();
        try {
            if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException ie) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
