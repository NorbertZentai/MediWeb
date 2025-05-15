// hu.project.MediTrack.modules.search.controller.FilterController.java
package hu.project.MediTrack.modules.search.controller;

import hu.project.MediTrack.modules.search.dto.FilterOptionName;
import hu.project.MediTrack.modules.search.service.FilterService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/filters")
public class FilterController {

    @Autowired
    private FilterService filterService;

    @GetMapping("/{name}") // dosage_form, active_substance, marketing_authorisation, dic_prescription
    public List<FilterOptionName> getFilterOptions(@PathVariable String name) {
        return filterService.getFilterOptions(name);
    }
}
