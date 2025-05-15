package hu.project.MediTrack.modules.favorite.repository;

import hu.project.MediTrack.modules.favorite.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {

    // Példa: lekérdezés user szerint
    List<Favorite> findByUserId(Integer userId);

    // Példa: lekérdezés medication szerint
    List<Favorite> findByMedicationId(Integer medicationId);

    // Ha korlátozni akarod, hogy 1 user + 1 medication csak egyszer szerepeljen:
    // Optional<Favorite> findByUserIdAndMedicationId(Integer userId, Integer medicationId);
}
