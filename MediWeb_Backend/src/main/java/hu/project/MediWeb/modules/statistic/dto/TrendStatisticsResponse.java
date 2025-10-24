package hu.project.MediWeb.modules.statistic.dto;

import java.util.List;

public record TrendStatisticsResponse(
        List<TimeSeriesPoint> history
) {
}
