package hu.project.MediTrack.modules.ingredient.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "active_ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200, unique = true)
    private String name;

    @Column(columnDefinition = "text")
    private String description;
}
