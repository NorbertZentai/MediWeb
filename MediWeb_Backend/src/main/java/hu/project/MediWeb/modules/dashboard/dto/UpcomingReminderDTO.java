package hu.project.MediWeb.modules.dashboard.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UpcomingReminderDTO {
    Long profileMedicationId;
    String profileName;
    String medicationName;
    String time;
    boolean overdue;
}
