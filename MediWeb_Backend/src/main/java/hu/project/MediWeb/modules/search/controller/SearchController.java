package hu.project.MediWeb.modules.search.controller;

import hu.project.MediWeb.modules.search.dto.MedicationSearchRequest;
import hu.project.MediWeb.modules.search.dto.MedicationSearchResult;
import hu.project.MediWeb.modules.search.service.SearchService;
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
