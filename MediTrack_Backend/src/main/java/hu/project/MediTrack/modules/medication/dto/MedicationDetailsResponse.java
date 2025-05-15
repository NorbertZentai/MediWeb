package hu.project.MediTrack.modules.medication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationDetailsResponse {
    // Alapadatok
    private String name;
    private String imageUrl;
    private String registrationNumber;
    private String substance;
    private String atcCode;
    private String company;
    private String legalBasis;
    private String status;
    private LocalDate authorizationDate;
    private String narcotic;

    // Dokumentumok
    private String patientInfoUrl;
    private String smpcUrl;
    private String labelUrl;

    // Összetevők / Tartalmak
    private boolean containsLactose;
    private boolean containsGluten;
    private boolean containsBenzoate;

    // Kiszerelések és helyettesítők
    private List<PackageInfo> packages;
    private List<SubstituteMedication> substitutes;

    // Engedélyezések
    private List<FinalSampleApproval> finalSamples;
    private List<DefectiveFormApproval> defectiveForms;

    // Házipatika adatok
    private HazipatikaResponse hazipatikaInfo;
}