package hu.project.MediWeb.modules.statistic.service;

import java.time.LocalDate;

public enum StatisticsPeriod {
    WEEKLY("weekly"),
    MONTHLY("monthly"),
    QUARTERLY("quarterly");

    private final String paramKey;

    StatisticsPeriod(String paramKey) {
        this.paramKey = paramKey;
    }

    public String getParamKey() {
        return paramKey;
    }

    public static StatisticsPeriod fromParam(String value) {
        if (value == null || value.isBlank()) {
            return MONTHLY;
        }
        for (StatisticsPeriod period : values()) {
            if (period.paramKey.equalsIgnoreCase(value.trim())) {
                return period;
            }
        }
        return MONTHLY;
    }

    public LocalDate startDate(LocalDate endDate) {
        return switch (this) {
            case WEEKLY -> endDate.minusDays(6);
            case MONTHLY -> endDate.minusDays(27);
            case QUARTERLY -> endDate.minusMonths(2).withDayOfMonth(1);
        };
    }
}
