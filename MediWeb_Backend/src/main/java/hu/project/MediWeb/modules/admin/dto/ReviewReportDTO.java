package hu.project.MediWeb.modules.admin.dto;

import hu.project.MediWeb.modules.review.entity.ReviewReport;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReportDTO {
    private Long reportId;
    private Long reviewId;
    private String reporterName;
    private String reporterEmail;
    private String reason;
    private String comment;
    private LocalDateTime reportedAt;

    // Review details
    private int rating;
    private String positive;
    private String negative;
    private String reviewAuthor;
    private String medicationName;
    private Integer medicationId;
    private long totalReports; // how many reports this review has

    public static ReviewReportDTO from(ReviewReport report, String medicationName, long totalReports) {
        return ReviewReportDTO.builder()
                .reportId(report.getId())
                .reviewId(report.getReview().getId())
                .reporterName(report.getReporter().getName())
                .reporterEmail(report.getReporter().getEmail())
                .reason(report.getReason())
                .comment(report.getComment())
                .reportedAt(report.getCreatedAt())
                .rating(report.getReview().getRating())
                .positive(report.getReview().getPositive())
                .negative(report.getReview().getNegative())
                .reviewAuthor(report.getReview().getUser().getName())
                .medicationName(medicationName)
                .medicationId(report.getReview().getItemId())
                .totalReports(totalReports)
                .build();
    }
}
