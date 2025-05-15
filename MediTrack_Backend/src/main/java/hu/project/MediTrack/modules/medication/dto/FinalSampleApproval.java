package hu.project.MediTrack.modules.medication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinalSampleApproval {
    private String packageDescription;
    private String documentNumber;
    private String decisionDate;
    private String comment;
}
