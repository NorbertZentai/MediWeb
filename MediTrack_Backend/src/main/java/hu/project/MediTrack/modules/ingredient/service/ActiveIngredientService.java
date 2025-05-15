package hu.project.MediTrack.modules.ingredient.service;

import hu.project.MediTrack.modules.ingredient.entity.ActiveIngredient;
import hu.project.MediTrack.modules.ingredient.repository.ActiveIngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActiveIngredientService {

    @Autowired
    private ActiveIngredientRepository ingredientRepository;

    /**
     * Minden hatóanyag lekérése.
     */
    public List<ActiveIngredient> findAll() {
        return ingredientRepository.findAll();
    }

    /**
     * Hatóanyag keresése ID alapján.
     */
    public Optional<ActiveIngredient> findById(Integer id) {
        return ingredientRepository.findById(id);
    }

    /**
     * Hatóanyag elmentése (új létrehozása vagy frissítése).
     */
    public ActiveIngredient save(ActiveIngredient ingredient) {
        // Itt lehet pl. duplikáció-ellenőrzés name alapján,
        // vagy bármilyen extra logika, validálás.
        return ingredientRepository.save(ingredient);
    }

    /**
     * Hatóanyag törlése ID alapján.
     */
    public void deleteById(Integer id) {
        ingredientRepository.deleteById(id);
    }

    /**
     * Opcionális plusz metódus példa: keresés név alapján.
     */
    public Optional<ActiveIngredient> findByName(String name) {
        return ingredientRepository.findByName(name);
    }
}
