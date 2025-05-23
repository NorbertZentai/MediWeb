package hu.project.MediTrack.modules.favorite.controller;

import hu.project.MediTrack.modules.favorite.dto.FavoriteDTO;
import hu.project.MediTrack.modules.favorite.entity.Favorite;
import hu.project.MediTrack.modules.favorite.service.FavoriteService;
import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private UserService userService;

    @GetMapping
    public List<FavoriteDTO> getMyFavorites(HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        return favoriteService.findByUserId(currentUser.getId().longValue()).stream()
                .map(fav -> FavoriteDTO.builder()
                        .id(fav.getId().longValue())
                        .userId(fav.getUser().getId().longValue())
                        .medicationId(fav.getMedication().getId().longValue())
                        .build())
                .toList();
    }

    @PostMapping("/{medicationId}")
    public FavoriteDTO createFavorite(@PathVariable Long medicationId, HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        Favorite favorite = favoriteService.saveFavorite(currentUser, medicationId);

        return FavoriteDTO.builder()
                .id(favorite.getId().longValue())
                .userId(currentUser.getId().longValue())
                .medicationId(favorite.getMedication().getId().longValue())
                .build();
    }

    @DeleteMapping("/{id}")
    public void deleteFavorite(@PathVariable Long id) {
        favoriteService.deleteById(id);
    }
}
