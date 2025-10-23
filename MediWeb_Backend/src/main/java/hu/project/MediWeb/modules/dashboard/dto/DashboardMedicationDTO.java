package hu.project.MediWeb.modules.dashboard.dto;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardMedicationDTO {
    Long profileMedicationId;
    String profileName;
    String medicationName;
    List<String> times;
    List<Boolean> takenFlags;
}
