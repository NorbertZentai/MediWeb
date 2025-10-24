package hu.project.MediWeb.modules.statistic.dto;

import java.util.List;

public record CategoryStatisticsResponse(
        List<CategoryBreakdownItem> categories
) {
}
