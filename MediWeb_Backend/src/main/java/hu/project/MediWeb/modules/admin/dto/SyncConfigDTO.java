package hu.project.MediWeb.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncConfigDTO {
    private int parallelism;
    private long delayMs;
    private int skipRecentDays;
    private double averageSecondsPerItem;
    private int totalKnownItems;
    private int discoveryLimit;
    private int persistenceChunkSize;
}
