package hu.project.MediWeb.modules.medication.controller;

import hu.project.MediWeb.modules.medication.dto.MedicationDetailsResponse;
import hu.project.MediWeb.modules.medication.dto.MedicationListItemResponse;
import hu.project.MediWeb.modules.medication.dto.MedicationSearchCriteria;
import hu.project.MediWeb.modules.medication.service.MedicationCatalogService;
import hu.project.MediWeb.modules.medication.service.MedicationService;
import hu.project.MediWeb.modules.medication.sync.MedicationBatchProcessor;
import hu.project.MediWeb.modules.medication.sync.MedicationSyncStatus;
import hu.project.MediWeb.modules.medication.sync.MedicationSyncStatusTracker;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/medication")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;
    private final MedicationCatalogService medicationCatalogService;
    private final MedicationSyncStatusTracker medicationSyncStatusTracker;
    private final MedicationBatchProcessor medicationBatchProcessor;

    @GetMapping("/search")
    public ResponseEntity<Page<MedicationListItemResponse>> searchMedications(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "atc", required = false) String atcCode,
            @RequestParam(value = "lactoseFree", required = false) Boolean lactoseFree,
            @RequestParam(value = "glutenFree", required = false) Boolean glutenFree,
            @RequestParam(value = "benzoateFree", required = false) Boolean benzoateFree,
            @RequestParam(value = "narcoticOnly", required = false) Boolean narcoticOnly,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "40") int size
    ) {
        MedicationSearchCriteria criteria = new MedicationSearchCriteria(query, atcCode, lactoseFree, glutenFree, benzoateFree, narcoticOnly);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        Page<MedicationListItemResponse> response = medicationCatalogService.search(criteria, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sync/status")
    public ResponseEntity<MedicationSyncStatus> getSyncStatus() {
        return ResponseEntity.ok(medicationSyncStatusTracker.snapshot());
    }

    @PostMapping("/sync/start")
    public ResponseEntity<Map<String, Object>> startSync(@RequestParam(value = "force", defaultValue = "false") boolean force) {
        if (medicationSyncStatusTracker.isRunning()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "A szinkronizáció már folyamatban van",
                            "running", true
                    ));
        }

    CompletableFuture.runAsync(() -> medicationBatchProcessor.refreshAllMedications(force));

        return ResponseEntity.accepted()
                .body(Map.of(
                        "message", "A szinkronizáció elindult",
            "running", true,
            "force", force
                ));
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<MedicationDetailsResponse> getDetails(@PathVariable Long itemId) {
        try {
            System.out.println("🔍 [MEDICATION] Starting getMedicationDetails for ID: " + itemId);
            MedicationDetailsResponse response = medicationService.getMedicationDetails(itemId);
            System.out.println("✅ [MEDICATION] Successfully retrieved details for ID: " + itemId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [MEDICATION] Error getting details for ID: " + itemId);
            System.err.println("❌ [MEDICATION] Error type: " + e.getClass().getSimpleName());
            System.err.println("❌ [MEDICATION] Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get medication details for ID: " + itemId, e);
        }
    }
}