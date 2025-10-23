package hu.project.MediWeb.modules.dashboard.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hu.project.MediWeb.modules.dashboard.dto.DashboardMedicationDTO;
import hu.project.MediWeb.modules.dashboard.dto.DashboardResponse;
import hu.project.MediWeb.modules.dashboard.dto.DashboardSummaryDTO;
import hu.project.MediWeb.modules.dashboard.dto.PopularMedicationDTO;
import hu.project.MediWeb.modules.dashboard.dto.UpcomingReminderDTO;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import hu.project.MediWeb.modules.notification.dto.TodaysMedicationDTO;
import hu.project.MediWeb.modules.notification.service.MedicationIntakeService;
import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.entity.ProfileMedication;
import hu.project.MediWeb.modules.profile.repository.ProfileMedicationRepository;
import hu.project.MediWeb.modules.profile.repository.ProfileRepository;
import hu.project.MediWeb.modules.profile.repository.projection.PopularMedicationProjection;
import hu.project.MediWeb.modules.search.repository.SearchRepository;
import hu.project.MediWeb.modules.search.repository.projection.SearchKeywordProjection;
import hu.project.MediWeb.modules.statistic.entity.Statistic;
import hu.project.MediWeb.modules.statistic.service.StatisticService;
import hu.project.MediWeb.modules.user.entity.User;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final int DEFAULT_POPULAR_LIMIT = 6;

    private final ProfileRepository profileRepository;
    private final ProfileMedicationRepository profileMedicationRepository;
    private final MedicationIntakeService medicationIntakeService;
    private final StatisticService statisticService;
    private final SearchRepository searchRepository;
    private final MedicationRepository medicationRepository;

    public DashboardService(ProfileRepository profileRepository,
                            ProfileMedicationRepository profileMedicationRepository,
                            MedicationIntakeService medicationIntakeService,
                            StatisticService statisticService,
                            SearchRepository searchRepository,
                            MedicationRepository medicationRepository) {
        this.profileRepository = profileRepository;
        this.profileMedicationRepository = profileMedicationRepository;
        this.medicationIntakeService = medicationIntakeService;
        this.statisticService = statisticService;
        this.searchRepository = searchRepository;
        this.medicationRepository = medicationRepository;
    }

    public DashboardResponse buildDashboardForUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User must not be null when building dashboard.");
        }

        List<Profile> profiles = profileRepository.findAllByUser(user);
        List<Long> profileIds = profiles.stream().map(Profile::getId).toList();
        List<ProfileMedication> profileMedications = profileIds.isEmpty()
                ? Collections.emptyList()
                : profileMedicationRepository.findByProfileIdIn(profileIds);

        Map<Long, ProfileMedication> profileMedicationLookup = profileMedications.stream()
                .collect(Collectors.toMap(ProfileMedication::getId, pm -> pm));

        DashboardComputationContext context = collectDailyMedicationData(profiles, profileMedicationLookup);

        DashboardSummaryDTO summary = buildSummary(user, profileMedications.size(), context);
        UpcomingReminderDTO upcomingReminder = calculateUpcomingReminder(context.todaysMedications());
        List<PopularMedicationDTO> popularMedications = getPopularMedications(DEFAULT_POPULAR_LIMIT);

        return DashboardResponse.builder()
                .summary(summary)
                .upcomingReminder(upcomingReminder)
                .popularMedications(popularMedications)
                .todaysMedications(context.todaysMedications())
                .build();
    }

    public List<PopularMedicationDTO> getPopularMedications(int limit) {
        List<PopularMedicationDTO> popularFromSearches = getPopularFromSearches(limit);

        if (popularFromSearches.size() >= limit) {
            return popularFromSearches;
        }

        int remaining = limit - popularFromSearches.size();
        List<PopularMedicationDTO> fallback = getPopularFromProfileAssignments(remaining);

        if (fallback.isEmpty()) {
            return popularFromSearches;
        }

        Set<Long> alreadyIncludedIds = popularFromSearches.stream()
                .map(PopularMedicationDTO::getItemId)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toSet());

        Set<String> alreadyIncludedNames = popularFromSearches.stream()
                .map(PopularMedicationDTO::getName)
                .filter(name -> name != null && !name.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        for (PopularMedicationDTO item : fallback) {
            boolean knownId = item.getItemId() != null && alreadyIncludedIds.contains(item.getItemId());
            boolean knownName = item.getName() != null && alreadyIncludedNames.contains(item.getName().toLowerCase());
            if (!knownId && !knownName) {
                popularFromSearches.add(item);
            }
            if (popularFromSearches.size() >= limit) {
                break;
            }
        }

        return popularFromSearches.size() > limit
                ? popularFromSearches.subList(0, limit)
                : popularFromSearches;
    }

    private DashboardSummaryDTO buildSummary(User user,
                                             int totalMedications,
                                             DashboardComputationContext context) {
        Double adherenceRate = context.totalReminders() > 0
                ? (double) context.remindersTaken() / context.totalReminders()
                : null;

    int userId = Math.toIntExact(user.getId());
    Optional<Statistic> statisticOptional = statisticService.findByUserId(userId);
        String lastSearch = statisticOptional
                .map(Statistic::getLastSearch)
                .map(LocalDateTime::toString)
                .orElse(null);

        return DashboardSummaryDTO.builder()
                .totalMedications(totalMedications)
                .remindersToday(context.totalReminders())
                .adherenceRate(adherenceRate)
                .lastSearch(lastSearch)
                .build();
    }

    private DashboardComputationContext collectDailyMedicationData(List<Profile> profiles,
                                                                   Map<Long, ProfileMedication> profileMedicationLookup) {
        List<DashboardMedicationDTO> todaysMedications = new ArrayList<>();
        int totalReminders = 0;
        int remindersTaken = 0;

        for (Profile profile : profiles) {
            List<TodaysMedicationDTO> medications = medicationIntakeService.getMedicationsForToday(profile.getId());
            for (TodaysMedicationDTO med : medications) {
                List<String> times = med.getTimes() != null ? med.getTimes() : Collections.emptyList();
                List<Boolean> takenFlags = med.getTakenFlags() != null ? med.getTakenFlags() : Collections.emptyList();

                totalReminders += times.size();
                remindersTaken += (int) takenFlags.stream().filter(Boolean.TRUE::equals).count();

                ProfileMedication profileMedication = profileMedicationLookup.get(med.getProfileMedicationId());
                String profileName = profileMedication != null && profileMedication.getProfile() != null
                        ? profileMedication.getProfile().getName()
                        : profile.getName();

                DashboardMedicationDTO dashboardMedication = DashboardMedicationDTO.builder()
                        .profileMedicationId(med.getProfileMedicationId())
                        .profileName(profileName)
                        .medicationName(med.getMedicationName())
                        .times(List.copyOf(times))
                        .takenFlags(List.copyOf(takenFlags))
                        .build();

                todaysMedications.add(dashboardMedication);
            }
        }

    return new DashboardComputationContext(List.copyOf(todaysMedications), totalReminders, remindersTaken);
    }

    private UpcomingReminderDTO calculateUpcomingReminder(List<DashboardMedicationDTO> todaysMedications) {
        if (todaysMedications.isEmpty()) {
            return null;
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        DashboardMedicationDTO bestMedication = null;
        LocalDateTime bestDateTime = null;
        boolean bestOverdue = false;
        String bestTimeLabel = null;

        for (DashboardMedicationDTO medication : todaysMedications) {
            List<String> times = medication.getTimes();
            List<Boolean> takenFlags = medication.getTakenFlags();

            for (int i = 0; i < times.size(); i++) {
                boolean taken = i < takenFlags.size() && Boolean.TRUE.equals(takenFlags.get(i));
                if (taken) {
                    continue;
                }

                String timeValue = times.get(i);
                LocalTime parsedTime = parseTimeSafe(timeValue);
                if (parsedTime == null) {
                    continue;
                }

                LocalDateTime candidateDateTime = today.atTime(parsedTime);
                boolean overdue = candidateDateTime.isBefore(now);

                if (bestDateTime == null) {
                    bestDateTime = candidateDateTime;
                    bestMedication = medication;
                    bestOverdue = overdue;
                    bestTimeLabel = timeValue;
                    continue;
                }

                if (bestOverdue && !overdue) {
                    bestDateTime = candidateDateTime;
                    bestMedication = medication;
                    bestOverdue = false;
                    bestTimeLabel = timeValue;
                    continue;
                }

                if (bestOverdue == overdue && candidateDateTime.isBefore(bestDateTime)) {
                    bestDateTime = candidateDateTime;
                    bestMedication = medication;
                    bestOverdue = overdue;
                    bestTimeLabel = timeValue;
                }
            }
        }

        if (bestMedication == null || bestTimeLabel == null) {
            return null;
        }

        return UpcomingReminderDTO.builder()
                .profileMedicationId(bestMedication.getProfileMedicationId())
                .profileName(bestMedication.getProfileName())
                .medicationName(bestMedication.getMedicationName())
                .time(formatTimeLabel(bestDateTime, bestTimeLabel))
                .overdue(bestOverdue)
                .build();
    }

    private List<PopularMedicationDTO> getPopularFromSearches(int limit) {
        List<SearchKeywordProjection> projections = searchRepository.findTopKeywords(PageRequest.of(0, limit));
        if (projections.isEmpty()) {
            return new ArrayList<>();
        }

        return projections.stream()
                .map(item -> mapKeywordToPopularMedication(item.getKeyword(), item.getSearchCount()))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private PopularMedicationDTO mapKeywordToPopularMedication(String keyword, Long count) {
        Optional<Medication> medicationOptional = medicationRepository.findFirstByNameIgnoreCase(keyword);
        return medicationOptional
                .map(medication -> PopularMedicationDTO.builder()
                        .itemId(medication.getId())
                        .name(medication.getName())
                        .searchCount(count)
                        .shortDescription(medication.getDescription())
                        .build())
                .orElseGet(() -> PopularMedicationDTO.builder()
                        .itemId(null)
                        .name(keyword)
                        .searchCount(count)
                        .shortDescription(null)
                        .build());
    }

    private List<PopularMedicationDTO> getPopularFromProfileAssignments(int limit) {
        if (limit <= 0) {
            return new ArrayList<>();
        }

        List<PopularMedicationProjection> projections = profileMedicationRepository.findTopMedications(PageRequest.of(0, limit));
        if (projections.isEmpty()) {
            return new ArrayList<>();
        }

        return projections.stream()
                .map(item -> {
                    Optional<Medication> medication = medicationRepository.findById(item.getMedicationId());
                    return medication
                            .map(med -> PopularMedicationDTO.builder()
                                    .itemId(med.getId())
                                    .name(med.getName())
                                    .searchCount(item.getUsageCount())
                                    .shortDescription(med.getDescription())
                                    .build())
                            .orElseGet(() -> PopularMedicationDTO.builder()
                                    .itemId(item.getMedicationId())
                                    .name(item.getName())
                                    .searchCount(item.getUsageCount())
                                    .shortDescription(null)
                                    .build());
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private LocalTime parseTimeSafe(String timeValue) {
        try {
            return LocalTime.parse(timeValue, TIME_FORMATTER);
        } catch (Exception ignored) {
            try {
                return LocalTime.parse(timeValue);
            } catch (Exception inner) {
                return null;
            }
        }
    }

    private String formatTimeLabel(LocalDateTime bestDateTime, String originalLabel) {
        if (bestDateTime == null) {
            return originalLabel;
        }
        return bestDateTime.toLocalTime().format(TIME_FORMATTER);
    }

    private record DashboardComputationContext(List<DashboardMedicationDTO> todaysMedications,
                                               int totalReminders,
                                               int remindersTaken) {
    }
}
