package hu.project.MediWeb.modules.statistic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticDTO {
    private Integer id;
    private Long userId;
    private Integer searchCount;
    private Integer medicationsAddedCount;
    private LocalDateTime lastSearch;
    private LocalDateTime lastMedicationAdded;
}
