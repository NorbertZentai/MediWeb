package hu.project.MediWeb.modules.medication.controller;

import hu.project.MediWeb.modules.medication.dto.MedicationDetailsResponse;
import hu.project.MediWeb.modules.medication.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medication")
@RequiredArgsConstructor
public class MedicationController {

    @Autowired
    private MedicationService medicationService;

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