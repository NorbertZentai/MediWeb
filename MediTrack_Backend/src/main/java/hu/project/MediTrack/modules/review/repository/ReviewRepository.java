package hu.project.MediTrack.modules.review.repository;

import hu.project.MediTrack.modules.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByItemId(int itemId);
}
