package hu.project.MediTrack.modules.search.controller;

import hu.project.MediTrack.modules.search.dto.MedicationSearchRequest;
import hu.project.MediTrack.modules.search.dto.MedicationSearchResult;
import hu.project.MediTrack.modules.search.service.SearchService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public List<MedicationSearchResult> searchMedications(MedicationSearchRequest request) {
        return searchService.searchMedications(request);
    }
}
