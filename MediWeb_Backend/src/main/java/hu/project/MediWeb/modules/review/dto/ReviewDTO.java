package hu.project.MediWeb.modules.review.dto;

import hu.project.MediWeb.modules.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long userId;
    private int rating;
    private String positive;
    private String negative;
    private String author;
    private LocalDateTime createdAt;
}