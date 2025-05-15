package hu.project.MediTrack.modules.ingredient.repository;

import hu.project.MediTrack.modules.ingredient.entity.ActiveIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * A hatóanyagok (ActiveIngredient) adatkezelését végző interfész.
 * Alap CRUD műveletek az ősosztályból jönnek (JpaRepository).
 */
public interface ActiveIngredientRepository extends JpaRepository<ActiveIngredient, Integer> {

    /**
     * Példa: ha név alapján keresnéd az összetevőt.
     */
    Optional<ActiveIngredient> findByName(String name);
}
