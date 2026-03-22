package hu.project.MediWeb.modules.review.controller;

import hu.project.MediWeb.modules.review.dto.ReviewDTO;
import hu.project.MediWeb.modules.review.dto.ReviewListResponse;
import hu.project.MediWeb.modules.review.service.ReviewService;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return userService.findUserByEmail(authentication.getName()).orElse(null);
    }

    @GetMapping("/me")
    public List<ReviewDTO> getMyReviews() {
        System.out.println("[ReviewController] GET /api/reviews/me hit");
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            System.out.println("[ReviewController] No current user found!");
            throw new RuntimeException("Unauthorized");
        }
        System.out.println("[ReviewController] Found user: " + currentUser.getEmail());
        return reviewService.getReviewListForUser(currentUser);
    }


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