package hu.project.MediTrack.modules.notification.controller;

import hu.project.MediTrack.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class NotificationTestController {

    private final NotificationService notificationService;

    @GetMapping("/api/test-notification")
    public String testNotification() {
        notificationService.sendScheduledReminders();
        return "Notification check lefutott!";
    }
}