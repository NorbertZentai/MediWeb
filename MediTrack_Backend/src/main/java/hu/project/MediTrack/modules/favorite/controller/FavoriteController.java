package hu.project.MediTrack.modules.favorite.controller;

import hu.project.MediTrack.modules.favorite.entity.Favorite;
import hu.project.MediTrack.modules.favorite.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller a Favorites kezeléséhez.
 * A React Native (vagy más) kliens hívja JSON kérésekkel.
 */
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * GET /api/favorites
     * Az összes kedvenc bejegyzés listája.
     */
    @GetMapping
    public List<Favorite> getAllFavorites() {
        return favoriteService.findAll();
    }

    /**
     * GET /api/favorites/{id}
     * Egy kedvenc lekérése ID alapján.
     */
    @GetMapping("/{id}")
    public Favorite getFavoriteById(@PathVariable Integer id) {
        Optional<Favorite> fav = favoriteService.findById(id);
        return fav.orElse(null);
    }

    /**
     * GET /api/favorites/user/{userId}
     * Egy user összes kedvencének lekérése.
     */
    @GetMapping("/user/{userId}")
    public List<Favorite> getFavoritesByUserId(@PathVariable Integer userId) {
        return favoriteService.findByUserId(userId);
    }

    /**
     * POST /api/favorites
     * Új favorite bejegyzés létrehozása.
     */
    @PostMapping
    public Favorite createFavorite(@RequestBody Favorite favorite) {
        return favoriteService.save(favorite);
    }

    /**
     * PUT /api/favorites/{id}
     * Létező bejegyzés frissítése.
     */
    @PutMapping("/{id}")
    public Favorite updateFavorite(@PathVariable Integer id, @RequestBody Favorite updated) {
        return favoriteService.findById(id)
                .map(f -> {
                    f.setUser(updated.getUser());
                    f.setMedication(updated.getMedication());
                    return favoriteService.save(f);
                })
                .orElse(null);
    }

    /**
     * DELETE /api/favorites/{id}
     * Kedvenc törlése ID alapján.
     */
    @DeleteMapping("/{id}")
    public void deleteFavorite(@PathVariable Integer id) {
        favoriteService.deleteById(id);
    }
}
