package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.dto.NotificationPreferenceRequest;
import hu.project.MediWeb.modules.notification.dto.NotificationPreferenceResponse;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<NotificationPreferenceResponse> getPreferences() {
        return getAuthenticatedUser()
                .map(user -> ResponseEntity.ok(NotificationPreferenceResponse.builder()
                        .emailEnabled(Boolean.TRUE.equals(user.getEmailNotificationsEnabled()))
                        .build()))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PutMapping
    public ResponseEntity<NotificationPreferenceResponse> updatePreferences(@RequestBody NotificationPreferenceRequest request) {
        return getAuthenticatedUser()
                .map(user -> {
                    user.setEmailNotificationsEnabled(request.isEmailEnabled());
                    User saved = userService.saveUser(user);
                    return ResponseEntity.ok(NotificationPreferenceResponse.builder()
                            .emailEnabled(Boolean.TRUE.equals(saved.getEmailNotificationsEnabled()))
                            .build());
                })
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    private Optional<User> getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }
        return userService.findUserByEmail(authentication.getName());
    }
}
