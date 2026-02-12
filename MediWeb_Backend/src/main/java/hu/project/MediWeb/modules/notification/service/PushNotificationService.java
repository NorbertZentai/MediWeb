package hu.project.MediWeb.modules.notification.service;

import hu.project.MediWeb.modules.notification.entity.ExpoPushToken;
import hu.project.MediWeb.modules.notification.repository.ExpoPushTokenRepository;
import hu.project.MediWeb.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final ExpoPushTokenRepository pushTokenRepository;
    private final RestTemplate restTemplate;

    public void sendPushNotification(User user, String title, String body, Map<String, Object> data) {
        List<ExpoPushToken> tokens = pushTokenRepository.findByUser(user);
        if (tokens.isEmpty()) {
            log.debug("No push tokens found for user {}", user.getEmail());
            return;
        }

        for (ExpoPushToken pushToken : tokens) {
            try {
                Map<String, Object> message = new HashMap<>();
                message.put("to", pushToken.getToken());
                message.put("sound", "default");
                message.put("title", title);
                message.put("body", body);
                if (data != null && !data.isEmpty()) {
                    message.put("data", data);
                }

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(message, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map responseBody = response.getBody();
                    Object dataObj = responseBody.get("data");
                    if (dataObj instanceof Map) {
                        Map dataMap = (Map) dataObj;
                        String status = (String) dataMap.get("status");
                        if ("error".equals(status)) {
                            String errorMessage = (String) dataMap.get("message");
                            String details = dataMap.get("details") != null ?
                                    ((Map) dataMap.get("details")).get("error") != null ?
                                            (String) ((Map) dataMap.get("details")).get("error") : "" : "";

                            if ("DeviceNotRegistered".equals(details)) {
                                log.warn("Push token invalid (DeviceNotRegistered), removing: {}", pushToken.getToken());
                                pushTokenRepository.delete(pushToken);
                            } else {
                                log.error("Expo push error for token {}: {} - {}", pushToken.getToken(), errorMessage, details);
                            }
                        } else {
                            log.info("Push notification sent to user {} (token: {}...)", user.getEmail(),
                                    pushToken.getToken().substring(0, Math.min(20, pushToken.getToken().length())));
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to send push notification to token {}", pushToken.getToken(), e);
            }
        }
    }
}
