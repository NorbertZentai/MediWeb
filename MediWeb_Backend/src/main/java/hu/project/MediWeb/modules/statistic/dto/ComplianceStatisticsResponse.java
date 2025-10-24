package hu.project.MediWeb.modules.statistic.dto;

import java.time.OffsetDateTime;

public record ComplianceStatisticsResponse(
        Double rate,
        long takenDoses,
        long totalDoses,
        String period,
        OffsetDateTime generatedAt
) {
}
