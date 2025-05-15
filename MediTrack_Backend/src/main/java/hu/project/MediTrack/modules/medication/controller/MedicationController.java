package hu.project.MediTrack.modules.medication.controller;

import hu.project.MediTrack.modules.medication.dto.MedicationDetailsResponse;
import hu.project.MediTrack.modules.medication.service.MedicationService;
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
    public MedicationDetailsResponse getDetails(@PathVariable int itemId) throws Exception {
        return medicationService.getMedicationDetails(itemId);
    }
}
