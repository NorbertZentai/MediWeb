package hu.project.MediTrack.modules.medication.controller;

import hu.project.MediTrack.modules.medication.dto.HazipatikaResponse;
import hu.project.MediTrack.modules.medication.service.HazipatikaSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medication/hazipatika")
public class HazipatikaController {

    @Autowired
    private HazipatikaSearchService hazipatikaSearchService;

    @GetMapping("/search")
    public HazipatikaResponse searchText(@RequestParam String q) throws Exception {
        return hazipatikaSearchService.searchMedication(q);
    }
}