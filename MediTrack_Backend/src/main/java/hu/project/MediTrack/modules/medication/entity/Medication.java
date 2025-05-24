package hu.project.MediTrack.modules.medication.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {
    @Id
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 200)
    private String imageUrl;

    @Column(length = 100)
    private String registrationNumber;

    @Column(length = 255)
    private String substance;

    @Column(length = 100)
    private String atcCode;

    @Column(length = 255)
    private String company;

    @Column(length = 100)
    private String legalBasis;

    @Column(length = 100)
    private String status;

    private LocalDate authorizationDate;

    @Column(length = 100)
    private String narcotic;

    private String patientInfoUrl;
    private String smpcUrl;
    private String labelUrl;

    private boolean containsLactose;
    private boolean containsGluten;
    private boolean containsBenzoate;

    @Column(columnDefinition = "TEXT")
    private String packagesJson;

    @Column(columnDefinition = "TEXT")
    private String substitutesJson;

    @Column(columnDefinition = "TEXT")
    private String finalSamplesJson;

    @Column(columnDefinition = "TEXT")
    private String defectiveFormsJson;

    @Column(columnDefinition = "TEXT")
    private String hazipatikaJson;

    @Column(length = 100)
    private String packaging;

    private LocalDate releaseDate;

    @Builder.Default
    @Transient
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 200)
    private String manufacturer;

    @Column(name = "last_updated")
    @CreationTimestamp
    private LocalDate lastUpdated;
}