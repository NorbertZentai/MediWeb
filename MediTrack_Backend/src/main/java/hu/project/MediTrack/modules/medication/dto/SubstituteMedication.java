package hu.project.MediTrack.modules.medication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubstituteMedication {
    private String name;
    private String registrationNumber;
    private Integer itemId;
}