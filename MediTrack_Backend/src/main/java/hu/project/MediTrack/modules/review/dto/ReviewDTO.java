package hu.project.MediTrack.modules.review.dto;

import hu.project.MediTrack.modules.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private User author;
    private int rating;
    private String positive;
    private String negative;
    private LocalDateTime createdAt;
}
