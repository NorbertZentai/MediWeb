package hu.project.MediWeb.modules.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationPreferenceResponse {
    private final boolean emailEnabled;
}
