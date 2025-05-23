package hu.project.MediTrack.modules.favorite.repository;

import hu.project.MediTrack.modules.favorite.entity.Favorite;
import hu.project.MediTrack.modules.medication.entity.Medication;
import hu.project.MediTrack.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    boolean existsByUserAndMedication(User user, Medication medication);
}
