package hu.project.MediTrack.modules.notification.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediTrack.modules.profile.dto.MultiDayReminderGroup;

import java.time.DayOfWeek;
import java.util.List;

public class ReminderUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<MultiDayReminderGroup> parseReminders(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Nem sikerült a reminders mezőt feldolgozni", e);
        }
    }

    public static String getDayCode(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "H";
            case TUESDAY -> "K";
            case WEDNESDAY -> "Sze";
            case THURSDAY -> "Cs";
            case FRIDAY -> "P";
            case SATURDAY -> "Szo";
            case SUNDAY -> "V";
        };
    }
}