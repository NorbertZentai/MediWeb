package hu.project.MediTrack.modules.favorite.controller;

import hu.project.MediTrack.modules.favorite.dto.FavoriteDTO;
import hu.project.MediTrack.modules.favorite.entity.Favorite;
import hu.project.MediTrack.modules.favorite.service.FavoriteService;
import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<FavoriteDTO>> getMyFavorites(HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        List<FavoriteDTO> favorites = favoriteService.findByUserId(currentUser.getId()).stream()
                .map(fav -> FavoriteDTO.builder()
                        .id(fav.getId())
                        .userId(fav.getUser().getId())
                        .medicationId(fav.getMedication().getId())
                        .build())
                .toList();
        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/{medicationId}")
    public ResponseEntity<FavoriteDTO> addToFavorites(@PathVariable Long medicationId, HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        Favorite favorite = favoriteService.addFavorite(currentUser, medicationId);
        FavoriteDTO dto = FavoriteDTO.builder()
                .id(favorite.getId())
                .userId(currentUser.getId())
                .medicationId(favorite.getMedication().getId())
                .build();
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<Void> removeFromFavorites(@PathVariable Long favoriteId) {
        favoriteService.deleteById(favoriteId);
        return ResponseEntity.ok().build();
    }
}