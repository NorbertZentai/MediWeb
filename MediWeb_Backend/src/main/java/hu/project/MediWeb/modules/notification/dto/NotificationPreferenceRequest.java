package hu.project.MediWeb.modules.notification.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationPreferenceRequest {
    private boolean emailEnabled;
}
