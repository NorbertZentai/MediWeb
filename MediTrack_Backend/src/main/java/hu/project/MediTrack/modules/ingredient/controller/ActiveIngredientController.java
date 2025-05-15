package hu.project.MediTrack.modules.ingredient.controller;

import hu.project.MediTrack.modules.ingredient.entity.ActiveIngredient;
import hu.project.MediTrack.modules.ingredient.service.ActiveIngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller a "active_ingredients" kezeléséhez.
 * A React Native (vagy más) kliens JSON kérésekkel használhatja.
 */
@RestController
@RequestMapping("/api/ingredients")
public class ActiveIngredientController {

    @Autowired
    private ActiveIngredientService ingredientService;

    /**
     * GET /api/ingredients
     * Minden hatóanyag lekérése.
     */
    @GetMapping
    public List<ActiveIngredient> getAllIngredients() {
        return ingredientService.findAll();
    }

    /**
     * GET /api/ingredients/{id}
     * Egy hatóanyag lekérése ID alapján.
     */
    @GetMapping("/{id}")
    public ActiveIngredient getIngredientById(@PathVariable Integer id) {
        Optional<ActiveIngredient> ai = ingredientService.findById(id);
        return ai.orElse(null);
    }

    /**
     * POST /api/ingredients
     * Új hatóanyag létrehozása.
     */
    @PostMapping
    public ActiveIngredient createIngredient(@RequestBody ActiveIngredient ingredient) {
        return ingredientService.save(ingredient);
    }

    /**
     * PUT /api/ingredients/{id}
     * Létező hatóanyag frissítése.
     */
    @PutMapping("/{id}")
    public ActiveIngredient updateIngredient(@PathVariable Integer id,
                                             @RequestBody ActiveIngredient updated) {
        return ingredientService.findById(id).map(ai -> {
            ai.setName(updated.getName());
            ai.setDescription(updated.getDescription());
            return ingredientService.save(ai);
        }).orElse(null);
    }

    /**
     * DELETE /api/ingredients/{id}
     * Hatóanyag törlése ID alapján.
     */
    @DeleteMapping("/{id}")
    public void deleteIngredient(@PathVariable Integer id) {
        ingredientService.deleteById(id);
    }
}
