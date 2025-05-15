package hu.project.MediTrack.modules.medication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DefectiveFormApproval {
    private String packageDescription;
    private String documentNumber;
    private String batchNumber;
    private String decisionDate;
    private String condition;
}

