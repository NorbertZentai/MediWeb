import React, { useState, useMemo } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "styles/theme"; // Feltételezve, hogy itt van a theme
import { haptics } from "utils/haptics";

const { width } = Dimensions.get("window");

const DAYS_OF_WEEK = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const MONTHS = [
    "Január", "Február", "Március", "Április", "Május", "Június",
    "Július", "Augusztus", "Szeptember", "Október", "November", "December"
];

export default function DatePickerModal({
    visible,
    processedDate, // Dátum objektum VAGY string (YYYY-MM-DD)
    onConfirm,
    onCancel,
    title = "Dátum kiválasztása",
    minDate,
    maxDate,
}) {
    // Kezdő dátum beállítása: ha van processedDate, akkor az, különben ma
    const initialDate = useMemo(() => {
        if (!processedDate) return new Date();
        const d = new Date(processedDate);
        return isNaN(d.getTime()) ? new Date() : d;
    }, [processedDate, visible]); // visible dependency, hogy minden nyitáskor frissüljön

    const [viewDate, setViewDate] = useState(initialDate); // A naptárban épp látható hónap
    const [selectedDate, setSelectedDate] = useState(initialDate); // A ténylegesen kiválasztott dátum

    // Ha megnyitjuk, állítsuk be a nézetet a kapott dátumra
    React.useEffect(() => {
        if (visible) {
            const d = initialDate;
            setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
            setSelectedDate(d);
        }
    }, [visible, initialDate]);

    const handlePrevMonth = () => {
        haptics.light();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        haptics.light();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (day) => {
        haptics.light();
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    const handleConfirm = () => {
        haptics.medium();
        onConfirm(selectedDate);
    };

    // Napok generálása
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Hét napja (0: Vasárnap -> konvertálás 0: Hétfő ... 6: Vasárnap)
        let firstDayWeekday = firstDayOfMonth.getDay();
        firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

        const days = [];
        // Üres helyek a hónap elején
        for (let i = 0; i < firstDayWeekday; i++) {
            days.push(null);
        }
        // Napok
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, [viewDate]);

    const isSelected = (day) => {
        if (!day) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === viewDate.getMonth() &&
            selectedDate.getFullYear() === viewDate.getFullYear()
        );
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear()
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                            </View>

                            {/* Month Navigation */}
                            <View style={styles.navRow}>
                                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                                    <FontAwesome5 name="chevron-left" size={16} color={theme.colors.textPrimary} />
                                </TouchableOpacity>
                                <Text style={styles.monthText}>
                                    {viewDate.getFullYear()}. {MONTHS[viewDate.getMonth()]}
                                </Text>
                                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                                    <FontAwesome5 name="chevron-right" size={16} color={theme.colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            {/* Weekdays */}
                            <View style={styles.weekRow}>
                                {DAYS_OF_WEEK.map((d, i) => (
                                    <Text key={i} style={styles.weekdayText}>{d}</Text>
                                ))}
                            </View>

                            {/* Days Grid */}
                            <View style={styles.daysGrid}>
                                {calendarDays.map((day, index) => {
                                    if (day === null) {
                                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                                    }
                                    const selected = isSelected(day);
                                    const today = isToday(day);
                                    return (
                                        <TouchableOpacity
                                            key={day}
                                            style={[
                                                styles.dayCell,
                                                selected && styles.dayCellSelected,
                                                !selected && today && styles.dayCellToday,
                                            ]}
                                            onPress={() => handleSelectDate(day)}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                selected && styles.dayTextSelected,
                                                !selected && today && styles.dayTextToday,
                                            ]}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Footer Buttons */}
                            <View style={styles.footer}>
                                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>Mégse</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                                    <Text style={styles.confirmButtonText}>Kiválaszt</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: 20,
        padding: 20,
        ...theme.shadows.lg,
    },
    header: {
        marginBottom: 15,
        alignItems: "center",
    },
    title: {
        fontSize: theme.fontSize.lg,
        fontWeight: "bold",
        color: theme.colors.primary,
    },
    navRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    navButton: {
        padding: 10,
    },
    monthText: {
        fontSize: theme.fontSize.base,
        fontWeight: "600",
        color: theme.colors.textPrimary,
    },
    weekRow: {
        flexDirection: "row",
        width: "100%",
        marginBottom: 10,
    },
    weekdayText: {
        width: "14.28%",
        textAlign: "center",
        fontSize: theme.fontSize.sm,
        fontWeight: "bold",
        color: theme.colors.textTertiary,
    },
    daysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        width: "100%",
    },
    dayCell: {
        width: "14.28%", // 100% / 7
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
        borderRadius: 20,
    },
    dayCellSelected: {
        backgroundColor: theme.colors.primary,
    },
    dayCellToday: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    dayText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textPrimary,
    },
    dayTextSelected: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    dayTextToday: {
        color: theme.colors.primary,
        fontWeight: "bold",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 10,
    },
    cancelButtonText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textSecondary,
        fontWeight: "600",
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
        ...theme.shadows.sm,
    },
    confirmButtonText: {
        fontSize: theme.fontSize.base,
        color: "#FFFFFF",
        fontWeight: "bold",
    },
});
