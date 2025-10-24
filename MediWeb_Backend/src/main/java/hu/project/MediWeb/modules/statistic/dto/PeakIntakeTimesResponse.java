package hu.project.MediWeb.modules.statistic.dto;

import java.util.List;

public record PeakIntakeTimesResponse(
        List<CountPoint> times
) {
}
