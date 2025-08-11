package hu.project.MediWeb.modules.review.repository;

import hu.project.MediWeb.modules.review.entity.Review;
import hu.project.MediWeb.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByItemId(int itemId);

    Optional<Review> findByItemIdAndUser(int itemId, User user);
}
