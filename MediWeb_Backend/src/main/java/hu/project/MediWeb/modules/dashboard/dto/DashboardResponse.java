package hu.project.MediWeb.modules.dashboard.dto;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardResponse {
    DashboardSummaryDTO summary;
    UpcomingReminderDTO upcomingReminder;
    List<PopularMedicationDTO> popularMedications;
    List<DashboardMedicationDTO> todaysMedications;
}
