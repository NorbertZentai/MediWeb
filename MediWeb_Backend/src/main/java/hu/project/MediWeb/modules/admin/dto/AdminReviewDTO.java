package hu.project.MediWeb.modules.admin.dto;

import hu.project.MediWeb.modules.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewDTO {
    private Long id;
    private String author;
    private Long authorId;
    private int rating;
    private String positive;
    private String negative;
    private Integer medicationId;
    private String medicationName;
    private LocalDateTime createdAt;
    private Boolean checked;
    private Boolean reported;

    public static AdminReviewDTO from(Review review, String medicationName) {
        return AdminReviewDTO.builder()
                .id(review.getId())
                .author(review.getUser() != null ? review.getUser().getName() : "Ismeretlen")
                .authorId(review.getUser() != null ? review.getUser().getId() : null)
                .rating(review.getRating())
                .positive(review.getPositive())
                .negative(review.getNegative())
                .medicationId(review.getItemId())
                .medicationName(medicationName != null ? medicationName : "Ismeretlen gyógyszer")
                .createdAt(review.getCreatedAt())
                .checked(review.getChecked() != null ? review.getChecked() : false)
                .reported(review.getReported() != null ? review.getReported() : false)
                .build();
    }
}
