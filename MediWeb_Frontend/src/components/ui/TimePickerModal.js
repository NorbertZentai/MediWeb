import React, { useState, useMemo, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "contexts/ThemeContext";

export default function TimePickerModal({
    visible,
    processedTime, // "HH:mm" string
    onConfirm,
    onCancel,
    title = "Időpont kiválasztása",
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [selectedHour, setSelectedHour] = useState(12);
    const [selectedMinute, setSelectedMinute] = useState(0);

    useEffect(() => {
        if (visible && processedTime) {
            const [h, m] = processedTime.split(':').map(Number);
            if (!isNaN(h)) setSelectedHour(h);
            if (!isNaN(m)) setSelectedMinute(m);
        } else if (visible) {
            const now = new Date();
            setSelectedHour(now.getHours());
            setSelectedMinute(now.getMinutes());
        }
    }, [visible, processedTime]);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleConfirm = () => {
        const formattedTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        onConfirm(formattedTime);
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
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                            </View>

                            <View style={styles.pickerContainer}>
                                {/* Hours */}
                                <View style={styles.column}>
                                    <Text style={styles.columnLabel}>Óra</Text>
                                    <ScrollView
                                        style={styles.scrollColumn}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={40} // Approximate item height
                                    >
                                        {hours.map((h) => (
                                            <TouchableOpacity
                                                key={`h-${h}`}
                                                style={[
                                                    styles.timeItem,
                                                    selectedHour === h && styles.selectedTimeItem
                                                ]}
                                                onPress={() => setSelectedHour(h)}
                                            >
                                                <Text style={[
                                                    styles.timeText,
                                                    selectedHour === h && styles.selectedTimeText
                                                ]}>
                                                    {h.toString().padStart(2, '0')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <Text style={styles.separator}>:</Text>

                                {/* Minutes */}
                                <View style={styles.column}>
                                    <Text style={styles.columnLabel}>Perc</Text>
                                    <ScrollView
                                        style={styles.scrollColumn}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={40}
                                    >
                                        {minutes.map((m) => (
                                            <TouchableOpacity
                                                key={`m-${m}`}
                                                style={[
                                                    styles.timeItem,
                                                    selectedMinute === m && styles.selectedTimeItem
                                                ]}
                                                onPress={() => setSelectedMinute(m)}
                                            >
                                                <Text style={[
                                                    styles.timeText,
                                                    selectedMinute === m && styles.selectedTimeText
                                                ]}>
                                                    {m.toString().padStart(2, '0')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>Mégse</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                                    <Text style={styles.confirmButtonText}>Kész</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const createStyles = (theme) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.components.modal.overlay,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        width: "100%",
        maxWidth: 320,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: 20,
        padding: 20,
        ...theme.shadows.lg,
    },
    header: {
        marginBottom: 20,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 10,
    },
    title: {
        fontSize: theme.fontSize.lg,
        fontWeight: "bold",
        color: theme.colors.textPrimary,
    },
    pickerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 200,
        marginBottom: 20,
    },
    column: {
        width: 80,
        height: "100%",
        alignItems: "center",
    },
    scrollColumn: {
        width: "100%",
    },
    columnLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textTertiary,
        marginBottom: 8,
        fontWeight: "600",
    },
    timeItem: {
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginVertical: 2,
    },
    selectedTimeItem: {
        backgroundColor: theme.colors.primaryMuted,
    },
    timeText: {
        fontSize: 20,
        color: theme.colors.textSecondary,
    },
    selectedTimeText: {
        color: theme.colors.primary,
        fontWeight: "bold",
        fontSize: 24,
    },
    separator: {
        fontSize: 32,
        fontWeight: "bold",
        color: theme.colors.textPrimary,
        paddingHorizontal: 10,
        paddingTop: 16, // Align with numbers below label
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
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
        borderRadius: 10,
    },
    confirmButtonText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.white,
        fontWeight: "bold",
    },
});
