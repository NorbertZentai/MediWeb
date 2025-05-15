package hu.project.MediTrack.modules.search.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicationSearchResult {
    private String name;
    private String link;
    private String substance;
    private String atc;
    private String company;
    private String status;
}
