package hu.project.MediWeb.modules.notification.utils;

import hu.project.MediWeb.modules.profile.dto.MultiDayReminderGroup;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tábla-vezérelt tesztek a {@link ReminderUtils#isDueAt(List, LocalDate, LocalTime)}
 * tiszta illesztő függvényhez.
 */
class ReminderUtilsTest {

    private static MultiDayReminderGroup group(List<String> days, List<String> times) {
        MultiDayReminderGroup group = new MultiDayReminderGroup();
        group.setDays(days);
        group.setTimes(times);
        return group;
    }

    @Test
    @DisplayName("Egyező nap és időpont esetén true")
    void matchingDayAndTime_returnsTrue() {
        List<MultiDayReminderGroup> groups = List.of(group(List.of("H"), List.of("08:00")));

        boolean result = ReminderUtils.isDueAt(groups, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0));

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Rossz nap esetén false")
    void wrongDay_returnsFalse() {
        List<MultiDayReminderGroup> groups = List.of(group(List.of("K"), List.of("08:00")));

        boolean result = ReminderUtils.isDueAt(groups, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0));

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Rossz perc esetén false")
    void wrongMinute_returnsFalse() {
        List<MultiDayReminderGroup> groups = List.of(group(List.of("H"), List.of("08:00")));

        boolean result = ReminderUtils.isDueAt(groups, LocalDate.of(2026, 9, 14), LocalTime.of(8, 1));

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Másodperccel rendelkező időpont is illeszkedik a HH:mm-re")
    void timeWithSeconds_stillMatches() {
        List<MultiDayReminderGroup> groups = List.of(group(List.of("H"), List.of("08:00")));

        boolean result = ReminderUtils.isDueAt(groups, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0, 45));

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Több csoport közül csak az egyik illeszkedik")
    void multipleGroups_onlyOneMatches() {
        List<MultiDayReminderGroup> groups = Arrays.asList(
                group(List.of("K"), List.of("09:00")),
                group(List.of("H"), List.of("08:00"))
        );

        boolean result = ReminderUtils.isDueAt(groups, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0));

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Üres lista esetén false, nem dob kivételt")
    void emptyList_returnsFalse() {
        boolean result = ReminderUtils.isDueAt(Collections.emptyList(), LocalDate.of(2026, 9, 14), LocalTime.of(8, 0));

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Null groups lista esetén false, nem dob kivételt")
    void nullGroupsList_returnsFalse() {
        boolean result = ReminderUtils.isDueAt(null, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0));

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Null days mező esetén false, nem dob kivételt")
    void nullDays_returnsFalse() {
        List<MultiDayReminderGroup> groups = List.of(group(null, List.of("08:00")));

        boolean result = ReminderUtils.isDueAt(groups, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0));

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Null times mező esetén false, nem dob kivételt")
    void nullTimes_returnsFalse() {
        List<MultiDayReminderGroup> groups = List.of(group(List.of("H"), null));

        boolean result = ReminderUtils.isDueAt(groups, LocalDate.of(2026, 9, 14), LocalTime.of(8, 0));

        assertThat(result).isFalse();
    }

    static Stream<Arguments> allDayCodes() {
        return Stream.of(
                Arguments.of(LocalDate.of(2026, 9, 14), "H"),   // hétfő
                Arguments.of(LocalDate.of(2026, 9, 15), "K"),   // kedd
                Arguments.of(LocalDate.of(2026, 9, 16), "Sze"), // szerda
                Arguments.of(LocalDate.of(2026, 9, 17), "Cs"),  // csütörtök
                Arguments.of(LocalDate.of(2026, 9, 18), "P"),   // péntek
                Arguments.of(LocalDate.of(2026, 9, 19), "Szo"), // szombat
                Arguments.of(LocalDate.of(2026, 9, 20), "V")    // vasárnap
        );
    }

    @ParameterizedTest
    @MethodSource("allDayCodes")
    @DisplayName("Mind a hét napkód egyezik a hozzá tartozó dátummal")
    void allSevenDayCodes_match(LocalDate date, String dayCode) {
        List<MultiDayReminderGroup> groups = List.of(group(List.of(dayCode), List.of("08:00")));

        boolean result = ReminderUtils.isDueAt(groups, date, LocalTime.of(8, 0));

        assertThat(result).isTrue();
    }
}
