package hu.project.MediTrack.modules.medication.entity;

import jakarta.persistence.*;
import lombok.*;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 200)
    private String manufacturer;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 100)
    private String packaging;

    private LocalDate releaseDate;

    @Column(precision = 2, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
}
