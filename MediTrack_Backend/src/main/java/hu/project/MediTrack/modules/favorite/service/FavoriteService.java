package hu.project.MediTrack.modules.favorite.service;

import hu.project.MediTrack.modules.favorite.entity.Favorite;
import hu.project.MediTrack.modules.favorite.repository.FavoriteRepository;
import hu.project.MediTrack.modules.medication.entity.Medication;
import hu.project.MediTrack.modules.medication.repository.MedicationRepository;
import hu.project.MediTrack.modules.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final MedicationRepository medicationRepository;

    @Transactional
    public List<Favorite> findByUserId(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    @Transactional
    public Favorite addFavorite(User user, Long medicationItemId) {
        Medication medication = medicationRepository.findById(medicationItemId)
                .orElseThrow(() -> new IllegalArgumentException("Gyógyszer nem található az itemId alapján: " + medicationItemId));

        return favoriteRepository.findByUserAndMedication(user, medication)
                .orElseGet(() -> {
                    Favorite favorite = Favorite.builder()
                            .user(user)
                            .medication(medication)
                            .build();
                    return favoriteRepository.save(favorite);
                });
    }

    @Transactional
    public void deleteById(Long id) {
        if (!favoriteRepository.existsById(id)) {
            throw new IllegalArgumentException("Nem létezik ilyen favorite ID: " + id);
        }
        favoriteRepository.deleteById(id);
    }
}