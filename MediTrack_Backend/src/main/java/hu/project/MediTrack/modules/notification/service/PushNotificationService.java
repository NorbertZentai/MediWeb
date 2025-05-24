package hu.project.MediTrack.modules.notification.service;

import hu.project.MediTrack.modules.notification.entity.PushSubscription;
import hu.project.MediTrack.modules.notification.repository.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final PushSubscriptionRepository subscriptionRepository;

    @org.springframework.beans.factory.annotation.Value("${push.vapid.public-key}")
    private String publicKey;

    @org.springframework.beans.factory.annotation.Value("${push.vapid.private-key}")
    private String privateKey;

    @org.springframework.beans.factory.annotation.Value("${push.vapid.subject}")
    private String subject;

    public void sendPushNotification(Long userId, String title, String body) {
        List<PushSubscription> subs = subscriptionRepository.findByUserId(userId);
        for (PushSubscription sub : subs) {
            try {
                var subscription = new Subscription(sub.getEndpoint(),
                        new Subscription.Keys(sub.getP256dh(), sub.getAuth()));

                String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\"}", title, body);

                var notification = new Notification(subscription, payload);

                var pushService = new PushService()
                        .setSubject(subject)
                        .setPublicKey(publicKey)
                        .setPrivateKey(privateKey);

                pushService.send(notification);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}