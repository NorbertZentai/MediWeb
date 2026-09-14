package hu.project.MediWeb.modules.notification.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.profile.dto.MultiDayReminderGroup;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ReminderUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

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

    /**
     * Tiszta, statikus illesztő: igazat ad vissza, ha a megadott csoportok közül
     * legalább az egyik tartalmazza a {@code date} napjának kódját, ÉS a
     * {@code time}-nak (másodperc/nanoszekundum nélkül, "HH:mm" formában) megfelelő
     * időpontot. Sosem dob kivételt: null lista, üres lista, illetve egy csoport
     * null days/times mezője esetén false-t ad vissza.
     */
    public static boolean isDueAt(List<MultiDayReminderGroup> groups, LocalDate date, LocalTime time) {
        if (groups == null || groups.isEmpty() || date == null || time == null) {
            return false;
        }

        String dayCode = getDayCode(date.getDayOfWeek());
        String formattedTime = time.format(TIME_FORMATTER);

        for (MultiDayReminderGroup group : groups) {
            if (group == null) {
                continue;
            }
            List<String> days = group.getDays();
            List<String> times = group.getTimes();
            if (days == null || times == null) {
                continue;
            }
            if (days.contains(dayCode) && times.contains(formattedTime)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Az adott időponthoz tartozó, pontosan idézőjeles "HH:mm" tokent állítja elő
     * (pl. {@code "\"08:00\""}), amit a ProfileMedicationRepository#findReminderCandidates
     * a reminders JSON oszlop LIKE szűréséhez használ.
     */
    public static String toTimeToken(LocalTime time) {
        return "\"" + time.format(TIME_FORMATTER) + "\"";
    }
}