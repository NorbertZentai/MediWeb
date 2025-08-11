package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.entity.PushSubscription;
import hu.project.MediWeb.modules.notification.repository.PushSubscriptionRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionRepository repository;
    private final UserService userService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody PushSubscription request) {
        // Get current user from JWT token in SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Nem vagy bejelentkezve.");
        }

        String email = authentication.getName();
        Optional<User> userOptional = userService.findUserByEmail(email);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Felhasználó nem található.");
        }

        User user = userOptional.get();
        request.setUserId(user.getId());
        PushSubscription saved = repository.save(request);
        return ResponseEntity.ok(saved.getId());
    }
}