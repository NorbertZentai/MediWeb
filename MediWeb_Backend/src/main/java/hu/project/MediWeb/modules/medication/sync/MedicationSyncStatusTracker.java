package hu.project.MediWeb.modules.medication.sync;

import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

@Component
public class MedicationSyncStatusTracker {

    private static final String PHASE_IDLE = "IDLE";
    private static final String PHASE_DISCOVERY = "ID_DISCOVERY";
    private static final String PHASE_PROCESSING = "ITEM_PROCESSING";
    private static final String PHASE_COMPLETED = "COMPLETED";

    private final ReentrantLock lock = new ReentrantLock();
    private volatile MedicationSyncStatus status = MedicationSyncStatus.idle();
    private final AtomicInteger discovered = new AtomicInteger();
    private final AtomicInteger processed = new AtomicInteger();
    private final AtomicInteger succeeded = new AtomicInteger();
    private final AtomicInteger failed = new AtomicInteger();
    private final AtomicInteger skipped = new AtomicInteger();
    private volatile int totalKnownItems;
    private volatile double averageSecondsPerItem;
    private volatile int parallelism;
    private volatile String phase = PHASE_IDLE;
    private volatile boolean discoveryCompleted = true;

    public boolean isRunning() {
        return status.running();
    }

    public void markStarted(int totalKnownItems, double averageSecondsPerItem, int parallelism) {
        lock.lock();
        try {
            discovered.set(0);
            processed.set(0);
            succeeded.set(0);
            failed.set(0);
            skipped.set(0);
        this.totalKnownItems = Math.max(totalKnownItems, 0);
            this.averageSecondsPerItem = averageSecondsPerItem > 0 ? averageSecondsPerItem : 10.0d;
            this.parallelism = Math.max(parallelism, 1);
        this.phase = PHASE_DISCOVERY;
        this.discoveryCompleted = false;
            OffsetDateTime startedAt = OffsetDateTime.now();
            double perItemSeconds = determinePerItemSeconds(0, startedAt);
            long totalSeconds = estimateTotalSeconds(perItemSeconds, startedAt, 0);
        status = new MedicationSyncStatus(
            true,
            startedAt,
            null,
            0,
            0,
            0,
            0,
            0,
            this.totalKnownItems,
            this.averageSecondsPerItem,
            this.parallelism,
            totalSeconds,
            totalSeconds,
            this.phase,
            this.discoveryCompleted,
            "OGYEI azonosítók kigyűjtése folyamatban"
        );
        } finally {
            lock.unlock();
        }
    }

    public void incrementDiscovered(int amount) {
        if (amount <= 0) {
            return;
        }
        int total = discovered.addAndGet(amount);
        this.totalKnownItems = Math.max(total, 0);
        updateSnapshot(total, processed.get(), succeeded.get(), failed.get(), skipped.get(), status.lastMessage());
    }

    public void incrementProcessed(boolean success, String message) {
        int processedValue = processed.incrementAndGet();
        int succeededValue = success ? succeeded.incrementAndGet() : succeeded.get();
        int failedValue = success ? failed.get() : failed.incrementAndGet();
        updateSnapshot(discovered.get(), processedValue, succeededValue, failedValue, skipped.get(), message);
    }

    public void incrementSkipped(String message) {
        int processedValue = processed.incrementAndGet();
        int skippedValue = skipped.incrementAndGet();
        updateSnapshot(discovered.get(), processedValue, succeeded.get(), failed.get(), skippedValue, message);
    }

    public void markFinished(String message) {
        lock.lock();
        try {
            OffsetDateTime startedAt = status.startedAt();
            double perItemSeconds = determinePerItemSeconds(processed.get(), startedAt);
            long totalSeconds = estimateTotalSeconds(perItemSeconds, startedAt, processed.get());
            long remainingSeconds = estimateRemainingSeconds(perItemSeconds, succeeded.get(), skipped.get());
            this.phase = PHASE_COMPLETED;
            this.discoveryCompleted = true;
            status = new MedicationSyncStatus(
                    false,
                    status.startedAt(),
                    OffsetDateTime.now(),
                    discovered.get(),
                    processed.get(),
                    succeeded.get(),
                    failed.get(),
                    skipped.get(),
                    totalKnownItems,
                    averageSecondsPerItem,
                    parallelism,
                    totalSeconds,
                    remainingSeconds,
                    this.phase,
                    this.discoveryCompleted,
                    message
            );
        } finally {
            lock.unlock();
        }
    }

    public MedicationSyncStatus snapshot() {
        return status;
    }

    public void markDiscoveryComplete(int totalDiscovered) {
        lock.lock();
        try {
            this.discoveryCompleted = true;
            this.phase = PHASE_PROCESSING;
            this.totalKnownItems = Math.max(totalDiscovered, 0);
            String message = "Azonosítók kigyűjtve (" + this.totalKnownItems + " tétel)";
            OffsetDateTime startedAt = status.startedAt();
            double perItemSeconds = determinePerItemSeconds(processed.get(), startedAt);
            long totalSeconds = estimateTotalSeconds(perItemSeconds, startedAt, processed.get());
            long remainingSeconds = estimateRemainingSeconds(perItemSeconds, succeeded.get(), skipped.get());
            status = new MedicationSyncStatus(
                    status.running(),
                    status.startedAt(),
                    status.finishedAt(),
                    discovered.get(),
                    processed.get(),
                    succeeded.get(),
                    failed.get(),
                    skipped.get(),
                    totalKnownItems,
                    averageSecondsPerItem,
                    parallelism,
                    totalSeconds,
                    remainingSeconds,
                    this.phase,
                    this.discoveryCompleted,
                    message
            );
        } finally {
            lock.unlock();
        }
    }

    private void updateSnapshot(int discoveredValue, int processedValue, int succeededValue, int failedValue, int skippedValue, String message) {
        lock.lock();
        try {
            String effectiveMessage = (message != null && !message.isBlank()) ? message : status.lastMessage();
            OffsetDateTime startedAt = status.startedAt();
            double perItemSeconds = determinePerItemSeconds(processedValue, startedAt);
            long totalSeconds = estimateTotalSeconds(perItemSeconds, startedAt, processedValue);
            long remainingSeconds = estimateRemainingSeconds(perItemSeconds, succeededValue, skippedValue);
            status = new MedicationSyncStatus(
                    status.running(),
                    status.startedAt(),
                    status.finishedAt(),
                    discoveredValue,
                    processedValue,
                    succeededValue,
                    failedValue,
                    skippedValue,
                    totalKnownItems,
                    averageSecondsPerItem,
                    parallelism,
                    totalSeconds,
                    remainingSeconds,
                    this.phase,
                    this.discoveryCompleted,
                    effectiveMessage
            );
        } finally {
            lock.unlock();
        }
    }

    private double determinePerItemSeconds(int processedValue, OffsetDateTime startedAt) {
        double baseline = baselinePerItemSeconds();
        if (processedValue <= 0 || startedAt == null) {
            return baseline;
        }

        long elapsedSeconds = java.time.Duration.between(startedAt, OffsetDateTime.now()).toSeconds();
        if (elapsedSeconds <= 0) {
            return baseline;
        }

        double measured = (double) elapsedSeconds / processedValue;
        if (!Double.isFinite(measured) || measured <= 0) {
            return baseline;
        }

        double weight = Math.min(processedValue / 200.0d, 1.0d);
        return baseline * (1.0d - weight) + measured * weight;
    }

    private double baselinePerItemSeconds() {
        double base = averageSecondsPerItem > 0 ? averageSecondsPerItem : 10.0d;
        return base / Math.max(parallelism, 1);
    }

    private long estimateTotalSeconds(double perItemSeconds, OffsetDateTime startedAt, int processedValue) {
        int baseTotal = totalKnownItems > 0 ? totalKnownItems : Math.max(discovered.get(), processedValue);
        double totalSeconds = Math.max(baseTotal, 0) * Math.max(perItemSeconds, 0.0d);
        return Math.max(0L, Math.round(totalSeconds));
    }

    private long estimateRemainingSeconds(double perItemSeconds, int succeededValue, int skippedValue) {
        int completedItems = Math.min(totalKnownItems, Math.max(succeededValue + skippedValue, 0));
        int remainingItems = Math.max(totalKnownItems - completedItems, 0);
        double remainingSeconds = remainingItems * Math.max(perItemSeconds, 0.0d);
        return Math.max(0L, Math.round(remainingSeconds));
    }
}
