package hu.project.MediTrack.modules.review.controller;

import hu.project.MediTrack.modules.review.dto.ReviewDTO;
import hu.project.MediTrack.modules.review.dto.ReviewListResponse;
import hu.project.MediTrack.modules.review.service.ReviewService;
import hu.project.MediTrack.modules.user.entity.User;
import hu.project.MediTrack.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @GetMapping("/{itemId}")
    public ReviewListResponse getReviews(@PathVariable int itemId) {
        return reviewService.getReviewListForItem(itemId);
    }

    @PostMapping("/{itemId}")
    public ReviewDTO submitReview(@PathVariable int itemId, @RequestBody ReviewDTO dto) {
        User user = userService.findUserById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));

        dto.setUserId(user.getId());

        return reviewService.submitReview(itemId, dto, user);
    }

    @PutMapping("/{itemId}")
    public ReviewDTO updateReview(@PathVariable int itemId, @RequestBody ReviewDTO dto ) {
        User user = userService.findUserById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));

        return reviewService.updateReview(itemId, dto, user);
    }
}