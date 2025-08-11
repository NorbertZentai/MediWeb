package hu.project.MediWeb.modules.review.service;

import hu.project.MediWeb.modules.review.dto.ReviewDTO;
import hu.project.MediWeb.modules.review.dto.ReviewListResponse;
import hu.project.MediWeb.modules.review.entity.Review;
import hu.project.MediWeb.modules.review.repository.ReviewRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;

    public ReviewListResponse getReviewListForItem(int itemId) {
        List<Review> reviews = reviewRepository.findByItemId(itemId);
        List<ReviewDTO> dtoList = reviews.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Map<Integer, Long> ratingDistribution = reviews.stream()
                .collect(Collectors.groupingBy(
                        Review::getRating,
                        Collectors.counting()
                ));

        return ReviewListResponse.builder()
                .reviews(dtoList)
                .averageRating(averageRating)
                .ratingDistribution(ratingDistribution)
                .build();
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

    public ReviewDTO updateReview(int itemId, ReviewDTO dto, User user) {
        Review review = reviewRepository.findByItemIdAndUser(itemId, user)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setRating(dto.getRating());
        review.setPositive(dto.getPositive());
        review.setNegative(dto.getNegative());
        review.setCreatedAt(LocalDateTime.now());

        return mapToDTO(reviewRepository.save(review));
    }

    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .author(review.getUser().getName())
                .userId(review.getUser().getId())
                .rating(review.getRating())
                .positive(review.getPositive())
                .negative(review.getNegative())
                .createdAt(review.getCreatedAt())
                .build();
    }
}