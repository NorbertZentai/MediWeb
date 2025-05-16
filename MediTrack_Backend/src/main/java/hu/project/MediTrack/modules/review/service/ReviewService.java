package hu.project.MediTrack.modules.review.service;

import hu.project.MediTrack.modules.review.dto.ReviewDTO;
import hu.project.MediTrack.modules.review.entity.Review;
import hu.project.MediTrack.modules.review.repository.ReviewRepository;
import hu.project.MediTrack.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public List<ReviewDTO> getReviewsForItem(int itemId) {
        return reviewRepository.findByItemId(itemId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO submitReview(int itemId, ReviewDTO dto, User user) {
        Review review = Review.builder()
                .itemId(itemId)
                .user(user)
                .rating(dto.getRating())
                .positive(dto.getPositive())
                .negative(dto.getNegative())
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);
        return mapToDTO(saved);
    }

    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .author(review.getUser())
                .rating(review.getRating())
                .positive(review.getPositive())
                .negative(review.getNegative())
                .createdAt(review.getCreatedAt())
                .build();
    }
}