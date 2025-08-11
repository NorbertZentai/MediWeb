package hu.project.MediWeb.modules.medication.controller;

import hu.project.MediWeb.modules.medication.dto.MedicationDetailsResponse;
import hu.project.MediWeb.modules.medication.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medication")
@RequiredArgsConstructor
public class MedicationController {

    @Autowired
    private MedicationService medicationService;

    @GetMapping("/{itemId}")
    public MedicationDetailsResponse getDetails(@PathVariable Long itemId) throws Exception {
        return medicationService.getMedicationDetails(itemId);
    }
}