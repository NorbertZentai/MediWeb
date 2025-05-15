package hu.project.MediTrack.modules.medication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HazipatikaResponse {
    private String title;
    private String url;
    private List<Section> sections;

    private String licenseHolder;
    private String substance;
    private String atc;

    private boolean normativeTbSupport;
    private boolean prescriptionRequired;
    private boolean publicHealthSupport;
    private boolean outsidePharmacy;
    private boolean euSupportable;
    private boolean euPrioritySupport;
    private boolean accidentCoverage;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Section {
        private String heading;
        private String html;
    }
}
