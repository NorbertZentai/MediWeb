package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.entity.PushSubscription;
import hu.project.MediWeb.modules.notification.repository.PushSubscriptionRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionRepository repository;
    private final UserService userService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody PushSubscription request, HttpServletRequest httpReq) {
        User user = userService.getCurrentUser(httpReq);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Nem vagy bejelentkezve.");
        }

        request.setUserId(user.getId());
        PushSubscription saved = repository.save(request);
        return ResponseEntity.ok(saved.getId());
    }
}