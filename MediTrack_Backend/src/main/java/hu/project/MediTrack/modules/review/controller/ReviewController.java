package hu.project.MediTrack.modules.review.controller;

import hu.project.MediTrack.modules.review.dto.ReviewDTO;
import hu.project.MediTrack.modules.review.service.ReviewService;
import hu.project.MediTrack.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{itemId}")
    public List<ReviewDTO> getReviews(@PathVariable int itemId) {
        return reviewService.getReviewsForItem(itemId);
    }

    @PostMapping("/{itemId}")
    public ReviewDTO submitReview( @PathVariable int itemId,  @RequestBody ReviewDTO dto,  @AuthenticationPrincipal User user) {
        return reviewService.submitReview(itemId, dto, user);
    }
}
