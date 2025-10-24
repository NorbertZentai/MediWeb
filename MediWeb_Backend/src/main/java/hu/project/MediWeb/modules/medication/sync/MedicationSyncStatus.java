package hu.project.MediWeb.modules.medication.sync;

import java.time.OffsetDateTime;

public record MedicationSyncStatus(
        boolean running,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,
        int discovered,
        int processed,
        int succeeded,
        int failed,
        int skipped,
        int totalKnown,
        double averageSecondsPerItem,
        int parallelism,
        long estimatedTotalSeconds,
        long estimatedRemainingSeconds,
        String phase,
        boolean discoveryCompleted,
        String lastMessage
) {
    public static MedicationSyncStatus idle() {
        return new MedicationSyncStatus(false, null, null, 0, 0, 0, 0, 0, 0, 10.0d, 1, 0, 0, "IDLE", true, null);
    }
}
