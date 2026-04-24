package hu.project.MediWeb.modules.admin.service;

import hu.project.MediWeb.modules.admin.dto.AdminDashboardDTO;
import hu.project.MediWeb.modules.admin.dto.AdminReviewDTO;
import hu.project.MediWeb.modules.admin.dto.AdminUserDTO;
import hu.project.MediWeb.modules.admin.dto.ReviewReportDTO;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import hu.project.MediWeb.modules.review.entity.Review;
import hu.project.MediWeb.modules.review.entity.ReviewReport;
import hu.project.MediWeb.modules.review.repository.ReviewRepository;
import hu.project.MediWeb.modules.review.repository.ReviewReportRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final MedicationRepository medicationRepository;

    public AdminDashboardDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        long totalMedications = medicationRepository.count();
        long totalReviews = reviewRepository.count();
        long uncheckedReviews = reviewRepository.findByChecked(false, Pageable.unpaged()).getTotalElements();
        long reportedReviews = reviewReportRepository.count();

        return AdminDashboardDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalMedications(totalMedications)
                .totalReviews(totalReviews)
                .uncheckedReviews(uncheckedReviews)
                .reportedReviews(reportedReviews)
                .build();
    }

    public Page<AdminUserDTO> getUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search.trim(), search.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(AdminUserDTO::from);
    }

    public Page<AdminReviewDTO> getReviews(Boolean checked, Pageable pageable) {
        Page<Review> reviews;
        if (checked != null) {
            reviews = reviewRepository.findByChecked(checked, pageable);
        } else {
            reviews = reviewRepository.findAll(pageable);
        }
        return reviews.map(review -> {
            String medicationName = resolveMedicationName(review.getItemId());
            return AdminReviewDTO.from(review, medicationName);
        });
    }

    public Page<ReviewReportDTO> getReportedReviews(Pageable pageable) {
        Page<ReviewReport> reports = reviewReportRepository.findAllBy(pageable);
        return reports.map(report -> {
            String medicationName = resolveMedicationName(report.getReview().getItemId());
            long totalReports = reviewReportRepository.countByReviewId(report.getReview().getId());
            return ReviewReportDTO.from(report, medicationName, totalReports);
        });
    }

    @Transactional
    public void checkReview(Long reviewId) {
        reviewRepository.findById(reviewId).ifPresent(review -> {
            review.setChecked(true);
            reviewRepository.save(review);
        });
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        // Delete associated reports first (cascade should handle this, but be explicit)
        reviewReportRepository.deleteByReviewId(reviewId);
        reviewRepository.deleteById(reviewId);
    }

    @Transactional
    public void dismissReport(Long reportId) {
        ReviewReport report = reviewReportRepository.findById(reportId).orElse(null);
        if (report == null) return;

        Long reviewId = report.getReview().getId();
        reviewReportRepository.deleteById(reportId);

        // If no more reports remain for this review, unmark it as reported
        long remaining = reviewReportRepository.countByReviewId(reviewId);
        if (remaining == 0) {
            reviewRepository.findById(reviewId).ifPresent(review -> {
                review.setReported(false);
                reviewRepository.save(review);
            });
        }
    }

    private String resolveMedicationName(Integer itemId) {
        if (itemId == null) return "Ismeretlen gyógyszer";
        return medicationRepository.findById(Long.valueOf(itemId))
                .map(Medication::getName)
                .orElse("Ismeretlen gyógyszer");
    }
}
