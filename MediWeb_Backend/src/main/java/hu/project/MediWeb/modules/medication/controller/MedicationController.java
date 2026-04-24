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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
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
            @RequestParam(value = "registrationNumber", required = false) String registrationNumber,
            @RequestParam(value = "lactoseFree", required = false) Boolean lactoseFree,
            @RequestParam(value = "glutenFree", required = false) Boolean glutenFree,
            @RequestParam(value = "benzoateFree", required = false) Boolean benzoateFree,
            @RequestParam(value = "narcoticOnly", required = false) Boolean narcoticOnly,
            @RequestParam(value = "hasFinalSample", required = false) Boolean hasFinalSample,
            @RequestParam(value = "hasDefectedForm", required = false) Boolean hasDefectedForm,
            @RequestParam(value = "fokozottFelugyelet", required = false) Boolean fokozottFelugyelet,
            @RequestParam(value = "authorisationDateFrom", required = false) String authorisationDateFromStr,
            @RequestParam(value = "authorisationDateTo", required = false) String authorisationDateToStr,
            @RequestParam(value = "revokeDateFrom", required = false) String revokeDateFromStr,
            @RequestParam(value = "revokeDateTo", required = false) String revokeDateToStr,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "40") int size) {

        LocalDate authorisationDateFrom = parseDate(authorisationDateFromStr);
        LocalDate authorisationDateTo = parseDate(authorisationDateToStr);
        LocalDate revokeDateFrom = parseDate(revokeDateFromStr);
        LocalDate revokeDateTo = parseDate(revokeDateToStr);

        MedicationSearchCriteria criteria = new MedicationSearchCriteria(
                query, atcCode, registrationNumber,
                lactoseFree, glutenFree, benzoateFree, narcoticOnly,
                hasFinalSample, hasDefectedForm, fokozottFelugyelet,
                authorisationDateFrom, authorisationDateTo,
                revokeDateFrom, revokeDateTo);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        Page<MedicationListItemResponse> response = medicationCatalogService.search(criteria, pageable);
        return ResponseEntity.ok(response);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank())
            return null;
        try {
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    @GetMapping("/sync/status")
    public ResponseEntity<MedicationSyncStatus> getSyncStatus() {
        return ResponseEntity.ok(medicationSyncStatusTracker.snapshot());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sync/start")
    public ResponseEntity<Map<String, Object>> startSync(
            @RequestParam(value = "force", defaultValue = "false") boolean force,
            @RequestParam(value = "limit", required = false) Integer limit) {
        if (medicationSyncStatusTracker.isRunning()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "A szinkronizáció már folyamatban van",
                            "running", true));
        }

        // Mark running BEFORE dispatching async task to avoid race condition
        int persistedCount = 0;
        try { persistedCount = medicationService.countStoredMedications(); } catch (Exception ignored) {}
        medicationSyncStatusTracker.markStarted(0, 10.0, 1, persistedCount);

        CompletableFuture.runAsync(() -> medicationBatchProcessor.refreshAllMedications(force, limit));

        Map<String, Object> body = new HashMap<>();
        body.put("message", "A szinkronizáció elindult");
        body.put("running", true);
        body.put("force", force);
        if (limit != null && limit > 0) {
            body.put("limit", limit);
        }

        return ResponseEntity.accepted().body(body);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sync/images")
    public ResponseEntity<Map<String, Object>> startImageSync(
            @RequestParam(value = "force", defaultValue = "false") boolean force,
            @RequestParam(value = "cleanup", defaultValue = "false") boolean cleanup) {
        if (medicationSyncStatusTracker.isRunning()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "A szinkronizáció már folyamatban van",
                            "running", true));
        }

        // Mark running BEFORE dispatching async task to avoid race condition
        // where frontend polls status before the async task starts
        String startMessage = cleanup
                ? "Hibás képek ellenőrzése és frissítés elindult"
                : force
                        ? "Az összes kép újrakeresése elindult"
                        : "A hiányzó képek frissítése elindult";
        int persistedCount = 0;
        try { persistedCount = medicationService.countStoredMedications(); } catch (Exception ignored) {}
        medicationSyncStatusTracker.markStarted(0, 2.0, 1, persistedCount, startMessage);

        CompletableFuture.runAsync(() -> medicationBatchProcessor.refreshMissingImages(force, cleanup));

        Map<String, Object> body = new HashMap<>();
        body.put("message", startMessage);
        body.put("running", true);
        body.put("type", "MISSING_IMAGES");
        body.put("force", force);
        body.put("cleanup", cleanup);

        return ResponseEntity.accepted().body(body);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sync/stop")
    public ResponseEntity<Map<String, Object>> stopSync() {
        if (!medicationSyncStatusTracker.isRunning()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "Jelenleg nincs futó szinkronizáció",
                            "running", false));
        }

        if (medicationSyncStatusTracker.isCancellationRequested()) {
            return ResponseEntity.ok(Map.of(
                    "message", "A leállítás már folyamatban van",
                    "running", true,
                    "stopping", true));
        }

        boolean accepted = medicationBatchProcessor.requestStop();
        if (!accepted) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "Nem sikerült leállítani a szinkronizációt",
                            "running", medicationSyncStatusTracker.isRunning()));
        }

        return ResponseEntity.accepted()
                .body(Map.of(
                        "message", "A szinkronizáció leállítása kezdeményezve",
                        "running", true,
                        "stopping", true));
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<?> getDetails(@PathVariable Long itemId) {
        try {
            log.debug("[MEDICATION] Starting getMedicationDetails for ID: {}", itemId);
            MedicationDetailsResponse response = medicationService.getMedicationDetails(itemId);
            log.debug("[MEDICATION] Successfully retrieved details for ID: {}", itemId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("[MEDICATION] Error getting details for ID: {}", itemId);
            log.error("[MEDICATION] Error type: {}", e.getClass().getSimpleName());
            log.error("[MEDICATION] Error message: {}", e.getMessage());

            // Check if it's a timeout or network error
            if (e.getMessage() != null &&
                    (e.getMessage().contains("nem elérhető") || e.getMessage().contains("Hálózati hiba"))) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of(
                                "error", "Service Unavailable",
                                "message", e.getMessage(),
                                "itemId", itemId));
            }

            // Other errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal Server Error",
                            "message", "Nem sikerült betölteni a gyógyszer adatait",
                            "itemId", itemId));
        } catch (Exception e) {
            log.error("[MEDICATION] Unexpected error for ID: {}", itemId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal Server Error",
                            "message", "Váratlan hiba történt",
                            "itemId", itemId));
        }
    }
}