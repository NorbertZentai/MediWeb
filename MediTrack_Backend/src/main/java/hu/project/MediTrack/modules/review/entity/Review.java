package hu.project.MediTrack.modules.review.entity;

import hu.project.MediTrack.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int rating;

    @Column(length = 1000)
    private String positive;

    @Column(length = 1000)
    private String negative;

    private LocalDateTime createdAt;
}
