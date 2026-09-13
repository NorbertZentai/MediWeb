package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("dev")
@RequiredArgsConstructor
public class NotificationTestController {

    private final NotificationService notificationService;

    @GetMapping("/api/test-notification")
    @PreAuthorize("hasRole('ADMIN')")
    public String testNotification() {
        notificationService.sendScheduledReminders();
        return "Notification check lefutott!";
    }
}