import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Platform,
    Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./FilterModal.style";
import { useTheme } from "contexts/ThemeContext";
import { haptics } from "utils/haptics";
import DatePickerModal from "components/ui/DatePickerModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BOOLEAN_FILTERS = [
    { field: "hasFinalSample", label: "Van véglegminta engedélye", icon: "vial" },
    { field: "hasDefectedForm", label: "Van alaki hiba engedélye", icon: "exclamation-triangle" },
    { field: "fokozottFelugyelet", label: "Fokozott felügyelet alatt áll", icon: "shield-alt" },
    { field: "lactoseFree", label: "Laktózmentes", icon: "leaf" },
    { field: "glutenFree", label: "Gluténmentes", icon: "bread-slice" },
    { field: "benzoateFree", label: "Benzoátmentes", icon: "flask" },
    { field: "narcoticOnly", label: "Csak kábítószer", icon: "pills" },
];

/**
 * Full-screen filter modal for the search screen.
 *
 * Props:
 *   visible         — boolean, whether the modal is open
 *   onClose         — () => void
 *   filters         — the current filter state object
 *   onFilterChange  — (field, value) => void
 *   onReset         — () => void
 */
export default function FilterModal({ visible, onClose, filters, onFilterChange, onReset }) {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const insets = useSafeAreaInsets();
    const activeCount = getActiveFilterCount(filters);
    const [activeDatePicker, setActiveDatePicker] = useState(null);

    const handleDateConfirm = (date) => {
        if (activeDatePicker) {
            const formatted = date.toISOString().split("T")[0]; // YYYY-MM-DD
            onFilterChange(activeDatePicker, formatted);
        }
        setActiveDatePicker(null);
    };

    const handleDateCancel = () => {
        setActiveDatePicker(null);
    };

    const parseDateValue = (value) => {
        if (!value) return new Date();
        try {
            const d = new Date(value + "T00:00:00");
            return isNaN(d.getTime()) ? new Date() : d;
        } catch {
            return new Date();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: Math.max(insets.top, theme.spacing.md) }]}>
                    <TouchableOpacity onPress={onClose} style={styles.headerButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <FontAwesome5 name="times" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Szűrők</Text>
                    <TouchableOpacity
                        onPress={() => {
                            haptics.light();
                            onReset();
                        }}
                        style={styles.headerButton}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Text style={[styles.resetText, activeCount === 0 && styles.resetTextDisabled]}>
                            Törlés
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.body}
                    contentContainerStyle={styles.bodyContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Boolean toggle filters */}
                    <Text style={styles.sectionTitle}>Jellemzők</Text>
                    <View style={styles.sectionCard}>
                        {BOOLEAN_FILTERS.map(({ field, label, icon }, index) => {
                            const isActive = !!filters[field];
                            const isLast = index === BOOLEAN_FILTERS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={field}
                                    style={[styles.toggleRow, !isLast && styles.toggleRowBorder]}
                                    onPress={() => {
                                        haptics.light();
                                        onFilterChange(field, !filters[field]);
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <View style={[styles.toggleIcon, isActive && styles.toggleIconActive]}>
                                        <FontAwesome5 name={icon} size={14} color={isActive ? theme.colors.white : theme.colors.textTertiary} />
                                    </View>
                                    <Text style={[styles.toggleLabel, isActive && styles.toggleLabelActive]}>
                                        {label}
                                    </Text>
                                    <View style={[styles.toggleSwitch, isActive && styles.toggleSwitchActive]}>
                                        <View style={[styles.toggleKnob, isActive && styles.toggleKnobActive]} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Text inputs */}
                    <Text style={styles.sectionTitle}>Azonosítók</Text>
                    <View style={styles.sectionCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>ATC kód</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="pl. N02BE01"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={filters.atcCode}
                                onChangeText={(text) => onFilterChange("atcCode", text)}
                                autoCapitalize="characters"
                            />
                        </View>
                        <View style={[styles.inputGroup, styles.inputGroupLast]}>
                            <Text style={styles.inputLabel}>Nyilvántartási szám</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="pl. OGYI-T-12345"
                                placeholderTextColor={theme.colors.textTertiary}
                                value={filters.registrationNumber}
                                onChangeText={(text) => onFilterChange("registrationNumber", text)}
                            />
                        </View>
                    </View>

                    {/* Date range inputs */}
                    <Text style={styles.sectionTitle}>Engedélyezés dátuma</Text>
                    <View style={styles.sectionCard}>
                        <View style={styles.dateRow}>
                            <View style={[styles.dateField, { marginRight: 8 }]}>
                                <Text style={styles.inputLabel}>-tól</Text>
                                <DateTrigger
                                    value={filters.authorisationDateFrom}
                                    placeholder="Kezdő dátum"
                                    onPress={() => setActiveDatePicker("authorisationDateFrom")}
                                    onClear={() => onFilterChange("authorisationDateFrom", "")}
                                    theme={theme}
                                    styles={styles}
                                />
                            </View>
                            <View style={[styles.dateField, { marginLeft: 8 }]}>
                                <Text style={styles.inputLabel}>-ig</Text>
                                <DateTrigger
                                    value={filters.authorisationDateTo}
                                    placeholder="Záró dátum"
                                    onPress={() => setActiveDatePicker("authorisationDateTo")}
                                    onClear={() => onFilterChange("authorisationDateTo", "")}
                                    theme={theme}
                                    styles={styles}
                                />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Törlés dátuma</Text>
                    <View style={styles.sectionCard}>
                        <View style={styles.dateRow}>
                            <View style={[styles.dateField, { marginRight: 8 }]}>
                                <Text style={styles.inputLabel}>-tól</Text>
                                <DateTrigger
                                    value={filters.revokeDateFrom}
                                    placeholder="Kezdő dátum"
                                    onPress={() => setActiveDatePicker("revokeDateFrom")}
                                    onClear={() => onFilterChange("revokeDateFrom", "")}
                                    theme={theme}
                                    styles={styles}
                                />
                            </View>
                            <View style={[styles.dateField, { marginLeft: 8 }]}>
                                <Text style={styles.inputLabel}>-ig</Text>
                                <DateTrigger
                                    value={filters.revokeDateTo}
                                    placeholder="Záró dátum"
                                    onPress={() => setActiveDatePicker("revokeDateTo")}
                                    onClear={() => onFilterChange("revokeDateTo", "")}
                                    theme={theme}
                                    styles={styles}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Custom themed date picker modal */}
                    <DatePickerModal
                        visible={activeDatePicker !== null}
                        processedDate={parseDateValue(filters[activeDatePicker])}
                        onConfirm={handleDateConfirm}
                        onCancel={handleDateCancel}
                        title={activeDatePicker ? getDatePickerTitle(activeDatePicker) : "Dátum kiválasztása"}
                    />
                </ScrollView>

                {/* Footer with apply button */}
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => {
                            haptics.medium();
                            onClose();
                        }}
                        activeOpacity={0.8}
                    >
                        <FontAwesome5 name="check" size={16} color={theme.colors.white} style={{ marginRight: 8 }} />
                        <Text style={styles.applyButtonText}>
                            {activeCount > 0 ? `Szűrők alkalmazása (${activeCount})` : "Bezárás"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

/** Small pressable trigger that shows the selected date or a placeholder */
function DateTrigger({ value, placeholder, onPress, onClear, theme, styles }) {
    const hasValue = !!value?.trim();

    const formatDisplay = (val) => {
        if (!val) return "";
        // Format YYYY-MM-DD → YYYY. MM. DD.
        const parts = val.split("-");
        if (parts.length === 3) return `${parts[0]}. ${parts[1]}. ${parts[2]}.`;
        return val;
    };

    return (
        <TouchableOpacity
            style={[styles.dateTrigger, hasValue && styles.dateTriggerActive]}
            onPress={() => {
                haptics.light();
                onPress();
            }}
            activeOpacity={0.6}
        >
            <FontAwesome5
                name="calendar-alt"
                size={14}
                color={hasValue ? theme.colors.primary : theme.colors.textTertiary}
                style={{ marginRight: 8 }}
            />
            <Text
                style={[styles.dateTriggerText, !hasValue && styles.dateTriggerPlaceholder]}
                numberOfLines={1}
            >
                {hasValue ? formatDisplay(value) : placeholder}
            </Text>
            {hasValue && (
                <TouchableOpacity
                    onPress={() => {
                        haptics.light();
                        onClear();
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginLeft: 4 }}
                >
                    <FontAwesome5 name="times-circle" size={14} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

/** Map picker field key → human readable title */
function getDatePickerTitle(field) {
    const titles = {
        authorisationDateFrom: "Engedélyezés kezdete",
        authorisationDateTo: "Engedélyezés vége",
        revokeDateFrom: "Törlés kezdete",
        revokeDateTo: "Törlés vége",
    };
    return titles[field] || "Dátum kiválasztása";
}

/** Count active filters */
export function getActiveFilterCount(filters) {
    let count = 0;
    if (filters.hasFinalSample) count++;
    if (filters.hasDefectedForm) count++;
    if (filters.fokozottFelugyelet) count++;
    if (filters.lactoseFree) count++;
    if (filters.glutenFree) count++;
    if (filters.benzoateFree) count++;
    if (filters.narcoticOnly) count++;
    if (filters.atcCode?.trim()) count++;
    if (filters.registrationNumber?.trim()) count++;
    if (filters.authorisationDateFrom?.trim()) count++;
    if (filters.authorisationDateTo?.trim()) count++;
    if (filters.revokeDateFrom?.trim()) count++;
    if (filters.revokeDateTo?.trim()) count++;
    return count;
}

/** Get labels of active filters for chips display */
export function getActiveFilterLabels(filters) {
    const labels = [];
    BOOLEAN_FILTERS.forEach(({ field, label }) => {
        if (filters[field]) labels.push({ field, label, type: "boolean" });
    });
    if (filters.atcCode?.trim()) labels.push({ field: "atcCode", label: `ATC: ${filters.atcCode}`, type: "text" });
    if (filters.registrationNumber?.trim()) labels.push({ field: "registrationNumber", label: `Nyilv.: ${filters.registrationNumber}`, type: "text" });
    if (filters.authorisationDateFrom?.trim()) labels.push({ field: "authorisationDateFrom", label: `Eng. tól: ${filters.authorisationDateFrom}`, type: "text" });
    if (filters.authorisationDateTo?.trim()) labels.push({ field: "authorisationDateTo", label: `Eng. ig: ${filters.authorisationDateTo}`, type: "text" });
    if (filters.revokeDateFrom?.trim()) labels.push({ field: "revokeDateFrom", label: `Törl. tól: ${filters.revokeDateFrom}`, type: "text" });
    if (filters.revokeDateTo?.trim()) labels.push({ field: "revokeDateTo", label: `Törl. ig: ${filters.revokeDateTo}`, type: "text" });
    return labels;
}
