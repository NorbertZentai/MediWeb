package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.dto.NotificationPreferenceRequest;
import hu.project.MediWeb.modules.notification.dto.NotificationPreferenceResponse;
import hu.project.MediWeb.modules.notification.dto.PushTokenRequest;
import hu.project.MediWeb.modules.notification.entity.ExpoPushToken;
import hu.project.MediWeb.modules.notification.repository.ExpoPushTokenRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final UserService userService;
    private final ExpoPushTokenRepository pushTokenRepository;

    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> getPreferences() {
        return getAuthenticatedUser()
                .map(user -> ResponseEntity.ok(NotificationPreferenceResponse.builder()
                        .emailEnabled(Boolean.TRUE.equals(user.getEmailNotificationsEnabled()))
                        .pushEnabled(Boolean.TRUE.equals(user.getPushNotificationsEnabled()))
                        .build()))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> updatePreferences(@RequestBody NotificationPreferenceRequest request) {
        return getAuthenticatedUser()
                .map(user -> {
                    user.setEmailNotificationsEnabled(request.isEmailEnabled());
                    user.setPushNotificationsEnabled(request.isPushEnabled());
                    User saved = userService.saveUser(user);
                    return ResponseEntity.ok(NotificationPreferenceResponse.builder()
                            .emailEnabled(Boolean.TRUE.equals(saved.getEmailNotificationsEnabled()))
                            .pushEnabled(Boolean.TRUE.equals(saved.getPushNotificationsEnabled()))
                            .build());
                })
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PostMapping("/push-token")
    public ResponseEntity<Void> registerPushToken(@RequestBody PushTokenRequest request) {
        return getAuthenticatedUser()
                .map(user -> {
                    String token = request.getToken();
                    if (token == null || token.isBlank()) {
                        return ResponseEntity.badRequest().<Void>build();
                    }

                    Optional<ExpoPushToken> existing = pushTokenRepository.findByToken(token);
                    if (existing.isPresent()) {
                        ExpoPushToken existingToken = existing.get();
                        if (!existingToken.getUser().getId().equals(user.getId())) {
                            pushTokenRepository.delete(existingToken);
                            pushTokenRepository.save(ExpoPushToken.builder()
                                    .user(user)
                                    .token(token)
                                    .build());
                        }
                    } else {
                        pushTokenRepository.save(ExpoPushToken.builder()
                                .user(user)
                                .token(token)
                                .build());
                    }

                    log.info("Push token registered for user {}", user.getEmail());
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @Transactional
    @DeleteMapping("/push-token")
    public ResponseEntity<Void> unregisterPushToken(@RequestBody PushTokenRequest request) {
        return getAuthenticatedUser()
                .map(user -> {
                    String token = request.getToken();
                    if (token == null || token.isBlank()) {
                        return ResponseEntity.badRequest().<Void>build();
                    }
                    pushTokenRepository.deleteByToken(token);
                    log.info("Push token unregistered for user {}", user.getEmail());
                    return ResponseEntity.ok().<Void>build();
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
