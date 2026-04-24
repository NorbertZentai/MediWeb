package hu.project.MediWeb.modules.review.service;

import hu.project.MediWeb.modules.review.dto.ReviewDTO;
import hu.project.MediWeb.modules.review.dto.ReviewListResponse;
import hu.project.MediWeb.modules.review.entity.Review;
import hu.project.MediWeb.modules.review.entity.ReviewReport;
import hu.project.MediWeb.modules.review.repository.ReviewRepository;
import hu.project.MediWeb.modules.review.repository.ReviewReportRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final UserService userService;
    private final MedicationRepository medicationRepository;

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

    public List<ReviewDTO> getReviewListForUser(User user) {
        return reviewRepository.findByUser(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void reportReview(Long reviewId, User reporter, String reason, String comment) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));

        // Prevent self-reporting
        if (review.getUser().getId().equals(reporter.getId())) {
            throw new IllegalArgumentException("Nem jelentheted be a saját értékelésed.");
        }

        // Check for duplicate report
        if (reviewReportRepository.existsByReviewIdAndReporterId(reviewId, reporter.getId())) {
            throw new IllegalStateException("Már bejelentettéd ezt az értékelést.");
        }

        ReviewReport report = ReviewReport.builder()
                .review(review)
                .reporter(reporter)
                .reason(reason)
                .comment(comment)
                .createdAt(LocalDateTime.now())
                .build();

        reviewReportRepository.save(report);

        // Mark the review as reported
        review.setReported(true);
        reviewRepository.save(review);
    }

    private ReviewDTO mapToDTO(Review review) {
        String medicationName = "Ismeretlen gyógyszer";
        if (review.getItemId() != null) {
            medicationName = medicationRepository.findById(Long.valueOf(review.getItemId()))
                    .map(Medication::getName)
                    .orElse("Ismeretlen gyógyszer");
        }

        return ReviewDTO.builder()
                .author(review.getUser().getName())
                .userId(review.getUser().getId())
                .rating(review.getRating())
                .positive(review.getPositive())
                .negative(review.getNegative())
                .medicationId(review.getItemId())
                .medicationName(medicationName)
                .createdAt(review.getCreatedAt())
                .build();
    }
}