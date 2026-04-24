package hu.project.MediWeb.modules.admin.controller;

import hu.project.MediWeb.modules.admin.dto.AdminDashboardDTO;
import hu.project.MediWeb.modules.admin.dto.AdminReviewDTO;
import hu.project.MediWeb.modules.admin.dto.AdminUserDTO;
import hu.project.MediWeb.modules.admin.dto.ReviewReportDTO;
import hu.project.MediWeb.modules.admin.dto.SyncConfigDTO;
import hu.project.MediWeb.modules.admin.service.AdminService;
import hu.project.MediWeb.modules.medication.sync.MedicationBatchProcessor;
import hu.project.MediWeb.modules.medication.sync.MedicationSyncStatus;
import hu.project.MediWeb.modules.medication.sync.MedicationSyncStatusTracker;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final MedicationBatchProcessor medicationBatchProcessor;
    private final MedicationSyncStatusTracker syncStatusTracker;

    // ────────── Dashboard ──────────

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ────────── User Management ──────────

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserDTO>> getUsers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "registration_date"));
        return ResponseEntity.ok(adminService.getUsers(search, pageable));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam("role") String role) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            User updated = userService.updateUserRole(id, userRole);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(AdminUserDTO.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Érvénytelen szerepkör: " + role));
        }
    }

    @PutMapping("/users/{id}/active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id, @RequestParam("active") boolean active) {
        return userService.findUserById(id)
                .map(user -> {
                    user.setIs_active(active);
                    userService.saveUser(user);
                    return ResponseEntity.ok(AdminUserDTO.from(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.findUserById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ────────── Review Moderation ──────────

    @GetMapping("/reviews")
    public ResponseEntity<Page<AdminReviewDTO>> getReviews(
            @RequestParam(value = "checked", required = false) Boolean checked,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getReviews(checked, pageable));
    }

    @PutMapping("/reviews/{id}/check")
    public ResponseEntity<Void> checkReview(@PathVariable Long id) {
        adminService.checkReview(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reviews/reported")
    public ResponseEntity<Page<ReviewReportDTO>> getReportedReviews(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getReportedReviews(pageable));
    }

    @DeleteMapping("/reviews/reports/{id}")
    public ResponseEntity<Void> dismissReport(@PathVariable Long id) {
        adminService.dismissReport(id);
        return ResponseEntity.noContent().build();
    }

    // ────────── Medication Sync Config ──────────

    @GetMapping("/sync/config")
    public ResponseEntity<SyncConfigDTO> getSyncConfig() {
        SyncConfigDTO config = SyncConfigDTO.builder()
                .parallelism(medicationBatchProcessor.getParallelism())
                .delayMs(medicationBatchProcessor.getDelayBetweenRequestsMs())
                .skipRecentDays(medicationBatchProcessor.getSkipRecentDays())
                .averageSecondsPerItem(medicationBatchProcessor.getAverageSecondsPerItem())
                .totalKnownItems(medicationBatchProcessor.getTotalKnownItems())
                .discoveryLimit(medicationBatchProcessor.getConfiguredDiscoveryLimit())
                .persistenceChunkSize(medicationBatchProcessor.getPersistenceChunkSize())
                .build();
        return ResponseEntity.ok(config);
    }

    @PutMapping("/sync/config")
    public ResponseEntity<SyncConfigDTO> updateSyncConfig(@RequestBody SyncConfigDTO config) {
        if (config.getParallelism() > 0) {
            medicationBatchProcessor.setParallelism(config.getParallelism());
        }
        if (config.getDelayMs() >= 0) {
            medicationBatchProcessor.setDelayBetweenRequestsMs(config.getDelayMs());
        }
        if (config.getSkipRecentDays() >= 0) {
            medicationBatchProcessor.setSkipRecentDays(config.getSkipRecentDays());
        }
        if (config.getAverageSecondsPerItem() > 0) {
            medicationBatchProcessor.setAverageSecondsPerItem(config.getAverageSecondsPerItem());
        }
        if (config.getDiscoveryLimit() != 0) {
            medicationBatchProcessor.setConfiguredDiscoveryLimit(config.getDiscoveryLimit());
        }
        if (config.getPersistenceChunkSize() > 0) {
            medicationBatchProcessor.setPersistenceChunkSize(config.getPersistenceChunkSize());
        }
        return getSyncConfig();
    }

    @GetMapping("/sync/status")
    public ResponseEntity<MedicationSyncStatus> getSyncStatus() {
        return ResponseEntity.ok(syncStatusTracker.snapshot());
    }
}
