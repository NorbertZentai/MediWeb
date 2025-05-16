package hu.project.MediTrack.modules.medication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "medications")
public class MedicationDetailsEntity {
    @Id
    private Integer id;

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

    private String patientInfoUrl;
    private String smpcUrl;
    private String labelUrl;

    private boolean containsLactose;
    private boolean containsGluten;
    private boolean containsBenzoate;

    @Lob
    private String packagesJson;

    @Lob
    private String substitutesJson;

    @Lob
    private String finalSamplesJson;

    @Lob
    private String defectiveFormsJson;

    @Lob
    private String hazipatikaJson;
}
