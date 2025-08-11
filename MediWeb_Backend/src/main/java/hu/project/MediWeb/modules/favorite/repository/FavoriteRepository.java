package hu.project.MediWeb.modules.favorite.repository;

import hu.project.MediWeb.modules.favorite.entity.Favorite;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    boolean existsByUserAndMedication(User user, Medication medication);

    Optional<Favorite> findByUserAndMedication(User user, Medication medication);
}