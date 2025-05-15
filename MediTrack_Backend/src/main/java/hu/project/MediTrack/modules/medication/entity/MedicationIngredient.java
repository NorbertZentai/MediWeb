package hu.project.MediTrack.modules.medication.entity;

import hu.project.MediTrack.modules.ingredient.entity.ActiveIngredient;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medication_ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kapcsolat a Medication-höz
    @ManyToOne
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    // Kapcsolat az ActiveIngredienthez
    @ManyToOne
    @JoinColumn(name = "ingredient_id", nullable = false)
    private ActiveIngredient ingredient;
}