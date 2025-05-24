package hu.project.MediTrack.modules.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodaysMedicationDTO {
    private Long profileMedicationId;
    private String medicationName;
    private List<String> times;
    private List<Boolean> takenFlags;
}