package hu.project.MediWeb.modules.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IntakeSubmissionRequest {
    private Long profileMedicationId;
    private String time;
    private boolean taken;
}