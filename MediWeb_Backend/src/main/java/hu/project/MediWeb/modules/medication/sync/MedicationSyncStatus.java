package hu.project.MediWeb.modules.medication.sync;

import java.time.OffsetDateTime;

public record MedicationSyncStatus(
        boolean running,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,
        int discovered,
        int discoveryScanned,
        int discoveryTarget,
        int processed,
        int succeeded,
        int failed,
        int skipped,
        int totalKnown,
        int totalPersisted,
        double averageSecondsPerItem,
        int parallelism,
        long estimatedTotalSeconds,
        long estimatedRemainingSeconds,
        String phase,
        boolean discoveryCompleted,
        String lastMessage,
        boolean cancellationRequested,
        int imagesCached,
        int imagesFetched,
        int imagesSkipped
) {
    public static MedicationSyncStatus idle() {
        return new MedicationSyncStatus(
                false,
                null,
                null,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                10.0d,
                1,
                0,
                0,
                "IDLE",
                true,
                null,
                false,
                0, // imagesCached
                0, // imagesFetched
                0  // imagesSkipped
        );
    }
}
