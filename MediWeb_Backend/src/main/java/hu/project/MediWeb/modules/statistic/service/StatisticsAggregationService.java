package hu.project.MediWeb.modules.statistic.service;

import hu.project.MediWeb.modules.notification.entity.MedicationIntakeLog;
import hu.project.MediWeb.modules.notification.repository.MedicationIntakeLogRepository;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.statistic.dto.CategoryBreakdownItem;
import hu.project.MediWeb.modules.statistic.dto.CategoryStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.ComplianceStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.CountPoint;
import hu.project.MediWeb.modules.statistic.dto.MissedDoseStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.PeakIntakeTimesResponse;
import hu.project.MediWeb.modules.statistic.dto.TimeSeriesPoint;
import hu.project.MediWeb.modules.statistic.dto.TrendStatisticsResponse;
import hu.project.MediWeb.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Map.entry;

@Service
@RequiredArgsConstructor
public class StatisticsAggregationService {

    private static final Map<Character, String> ATC_GROUPS = Map.ofEntries(
            entry('A', "Emesztorendszer es anyagcsere"),
            entry('B', "Ver es verkepzes"),
            entry('C', "Sziv es versystem"),
            entry('D', "Borgyogyaszati szerek"),
            entry('G', "Uro-genitalis szervek"),
            entry('H', "Hormonkeszitmenyek"),
            entry('J', "Fertozes elleni szerek"),
            entry('L', "Daganatellenes szerek"),
            entry('M', "Mozgasszervi szerek"),
            entry('N', "Idegrendszerre hato szerek"),
            entry('P', "Parazita elleni szerek"),
            entry('R', "Legzoszervekre hato szerek"),
            entry('S', "Erzekeles szerveire hato szerek"),
            entry('V', "Vegyes keszitmenyek")
    );

    private static final DateTimeFormatter DAILY_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MM.dd");
    private static final DateTimeFormatter MONTH_LABEL_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM", new Locale("hu"));

    private final MedicationIntakeLogRepository intakeLogRepository;

    public ComplianceStatisticsResponse getComplianceStatistics(User user, StatisticsPeriod period) {
        LocalDate end = LocalDate.now();
        LocalDate start = period.startDate(end);
        List<MedicationIntakeLog> logs = loadIntakeLogs(user.getId(), start, end);

        long total = logs.size();
        long taken = logs.stream().filter(MedicationIntakeLog::isTaken).count();
        Double rate = total > 0 ? (double) taken / total : null;

        return new ComplianceStatisticsResponse(
                rate,
                taken,
                total,
                period.getParamKey(),
                OffsetDateTime.now()
        );
    }

    public TrendStatisticsResponse getTrendStatistics(User user, StatisticsPeriod period) {
        LocalDate end = LocalDate.now();
        List<TimeWindow> windows = buildWindows(period, end);
        if (windows.isEmpty()) {
            return new TrendStatisticsResponse(List.of());
        }

        List<MedicationIntakeLog> logs = loadIntakeLogs(user.getId(), windows.get(0).start(), windows.get(windows.size() - 1).end());

        List<TimeSeriesPoint> history = new ArrayList<>();
        for (TimeWindow window : windows) {
            List<MedicationIntakeLog> windowLogs = filterLogs(logs, window);
            if (windowLogs.isEmpty()) {
                continue;
            }
            long total = windowLogs.size();
            long taken = windowLogs.stream().filter(MedicationIntakeLog::isTaken).count();
            Double rate = total > 0 ? (double) taken / total : null;
            history.add(new TimeSeriesPoint(window.label(), rate));
        }

        return new TrendStatisticsResponse(history);
    }

    public CategoryStatisticsResponse getCategoryStatistics(User user, StatisticsPeriod period) {
    LocalDate end = LocalDate.now();
    LocalDate start = period.startDate(end);
    List<MedicationIntakeLog> logs = loadIntakeLogs(user.getId(), start, end);

    Map<Long, ProfileMedication> uniqueMedications = logs.stream()
        .map(MedicationIntakeLog::getProfileMedication)
        .filter(pm -> pm != null && pm.getMedication() != null)
        .collect(Collectors.toMap(
            ProfileMedication::getId,
            pm -> pm,
            (left, right) -> left
        ));

    Map<String, Long> counts = uniqueMedications.values().stream()
        .collect(Collectors.groupingBy(
            this::resolveCategory,
            Collectors.counting()
        ));

    List<CategoryBreakdownItem> items = counts.entrySet().stream()
        .filter(entry -> entry.getValue() > 0)
        .map(entry -> new CategoryBreakdownItem(entry.getKey(), entry.getValue()))
        .sorted(Comparator.comparingLong(CategoryBreakdownItem::value).reversed())
        .toList();

    return new CategoryStatisticsResponse(items);
    }

    public MissedDoseStatisticsResponse getMissedDoseStatistics(User user, StatisticsPeriod period) {
        LocalDate end = LocalDate.now();
        List<TimeWindow> windows = buildWindows(period, end);
        if (windows.isEmpty()) {
            return new MissedDoseStatisticsResponse(List.of());
        }

        List<MedicationIntakeLog> logs = loadIntakeLogs(user.getId(), windows.get(0).start(), windows.get(windows.size() - 1).end());
        List<CountPoint> points = new ArrayList<>();

        for (TimeWindow window : windows) {
            long missed = filterLogs(logs, window).stream()
                    .filter(log -> !log.isTaken())
                    .count();
            if (missed > 0) {
                points.add(new CountPoint(window.label(), missed));
            }
        }

        return new MissedDoseStatisticsResponse(points);
    }

    public PeakIntakeTimesResponse getPeakIntakeTimes(User user, StatisticsPeriod period) {
        LocalDate end = LocalDate.now();
        LocalDate start = period.startDate(end);
        List<MedicationIntakeLog> logs = loadIntakeLogs(user.getId(), start, end);

        Map<String, Long> counts = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> toTimeLabel(log.getIntakeTime()),
                        Collectors.counting()
                ));

        List<CountPoint> points = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .map(entry -> new CountPoint(entry.getKey(), entry.getValue()))
                .toList();

        return new PeakIntakeTimesResponse(points);
    }

    private List<MedicationIntakeLog> loadIntakeLogs(Long userId, LocalDate start, LocalDate end) {
        LocalDate effectiveStart = start == null ? end.minusDays(30) : start;
        LocalDate effectiveEnd = end == null ? LocalDate.now() : end;
        if (effectiveStart.isAfter(effectiveEnd)) {
            effectiveStart = effectiveEnd.minusDays(30);
        }
        return intakeLogRepository.findByProfileMedicationProfileUserIdAndIntakeDateBetweenOrderByIntakeDateAsc(
                userId,
                effectiveStart,
                effectiveEnd
        );
    }

    private List<MedicationIntakeLog> filterLogs(List<MedicationIntakeLog> logs, TimeWindow window) {
        return logs.stream()
                .filter(log -> !log.getIntakeDate().isBefore(window.start()) && !log.getIntakeDate().isAfter(window.end()))
                .collect(Collectors.toList());
    }

    private List<TimeWindow> buildWindows(StatisticsPeriod period, LocalDate end) {
        List<TimeWindow> windows = new ArrayList<>();
        LocalDate start = period.startDate(end);

        switch (period) {
            case WEEKLY -> {
                LocalDate cursor = start;
                for (int i = 0; i < 7; i++) {
                    LocalDate day = cursor.plusDays(i);
                    if (day.isAfter(end)) {
                        break;
                    }
                    windows.add(new TimeWindow(day, day, DAILY_LABEL_FORMATTER.format(day)));
                }
            }
            case MONTHLY -> {
                for (int i = 0; i < 4; i++) {
                    LocalDate windowStart = start.plusDays(i * 7L);
                    if (windowStart.isAfter(end)) {
                        break;
                    }
                    LocalDate windowEnd = windowStart.plusDays(6);
                    if (windowEnd.isAfter(end)) {
                        windowEnd = end;
                    }
                    windows.add(new TimeWindow(windowStart, windowEnd, "Het " + (i + 1)));
                }
            }
            case QUARTERLY -> {
                YearMonth endMonth = YearMonth.from(end);
                YearMonth startMonth = YearMonth.from(start);
                YearMonth cursor = startMonth;
                while (!cursor.isAfter(endMonth)) {
                    LocalDate windowStart = cursor.atDay(1);
                    LocalDate windowEnd = cursor.atEndOfMonth();
                    if (windowStart.isBefore(start)) {
                        windowStart = start;
                    }
                    if (windowEnd.isAfter(end)) {
                        windowEnd = end;
                    }
                    windows.add(new TimeWindow(windowStart, windowEnd, MONTH_LABEL_FORMATTER.format(cursor.atDay(1))));
                    cursor = cursor.plusMonths(1);
                }
            }
        }

        return windows;
    }

    private String resolveCategory(ProfileMedication profileMedication) {
        if (profileMedication == null || profileMedication.getMedication() == null) {
            return "Ismeretlen";
        }
        String atcCode = profileMedication.getMedication().getAtcCode();
        if (!StringUtils.hasText(atcCode)) {
            return "Ismeretlen";
        }
        char key = Character.toUpperCase(atcCode.charAt(0));
        return ATC_GROUPS.getOrDefault(key, "Egyeb");
    }

    private String toTimeLabel(LocalTime time) {
        return time == null ? "" : time.toString();
    }

    private record TimeWindow(LocalDate start, LocalDate end, String label) {
    }
}
