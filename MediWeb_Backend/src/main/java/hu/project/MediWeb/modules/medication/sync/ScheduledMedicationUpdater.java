package hu.project.MediWeb.modules.medication.sync;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledMedicationUpdater {

    private final MedicationBatchProcessor batchProcessor;
    private final MedicationSyncStatusTracker statusTracker;

    @Value("${medication.sync.enabled:true}")
    private boolean schedulingEnabled;

    @Scheduled(cron = "${medication.sync.cron:0 0 2 1 * ?}")
    public void scheduledMedicationDataUpdate() {
        if (!schedulingEnabled) {
            log.debug("Medication sync scheduling disabled");
            return;
        }
        if (statusTracker.isRunning()) {
            log.warn("Medication sync already in progress, skipping scheduled run");
            return;
        }
        log.info("Időzített gyógyszer adatbázis frissítés indul");
        batchProcessor.refreshAllMedications();
    }
}
