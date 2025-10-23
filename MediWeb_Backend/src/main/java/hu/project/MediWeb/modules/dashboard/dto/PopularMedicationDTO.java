package hu.project.MediWeb.modules.dashboard.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PopularMedicationDTO {
    Long itemId;
    String name;
    Long searchCount;
    String shortDescription;
}
