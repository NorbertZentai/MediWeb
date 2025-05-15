package hu.project.MediTrack.modules.search.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicationSearchRequest {
    private String freetext;
    private Integer dosageForm;
    private String atcCode;
    private Integer activeSubstance;
    private Integer marketingAuthorisation;
    private Integer dicPrescription;
    private String registrationNumber;
    private String authorisationDateFrom;
    private String authorisationDateTo;
    private String revokeDateFrom;
    private String revokeDateTo;

    private Boolean lactose;
    private Boolean gluten;
    private Boolean benzoate;
    private Boolean hasFinalSample;
    private Boolean hasDefectedForm;
    private Boolean fokozottFelugyelet;
    private Boolean kpBesorolas;
}
