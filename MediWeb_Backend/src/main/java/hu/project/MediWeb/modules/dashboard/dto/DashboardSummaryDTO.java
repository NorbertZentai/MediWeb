package hu.project.MediWeb.modules.dashboard.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardSummaryDTO {
    int totalMedications;
    int remindersToday;
    Double adherenceRate;
    String lastSearch;
}
