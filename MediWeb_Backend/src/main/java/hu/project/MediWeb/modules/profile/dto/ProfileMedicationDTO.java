package hu.project.MediWeb.modules.profile.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.profile.entity.Profile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileMedicationDTO {
    private Long id;
    private Long profileId;
    private Long medicationId;
    private String medicationName;
    private String notes;
    private String reminders;
    private LocalDateTime createdAt;
}
