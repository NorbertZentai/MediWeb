import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Platform,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { createStyles } from "./CustomDropdown.style";
import { useTheme } from "contexts/ThemeContext";

/**
 * A custom, styled dropdown replacement for @react-native-picker/picker.
 *
 * Props:
 *   options      — Array of { label: string, value: any }
 *   selectedValue — The currently selected value
 *   onValueChange — (value) => void
 *   placeholder  — Placeholder text when nothing is selected (default: "Válassz...")
 *   disabled     — Boolean
 *   style        — Extra container styles
 */
export default function CustomDropdown({
    options = [],
    selectedValue,
    onValueChange,
    placeholder = "Válassz...",
    disabled = false,
    style,
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [open, setOpen] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const selectedOption = options.find((o) => o.value === selectedValue);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;
    const isPlaceholder = !selectedOption;

    useEffect(() => {
        if (open) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [open]);

    const handleSelect = (value) => {
        onValueChange(value);
        setOpen(false);
    };

    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setOpen(false));
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={[
                    styles.trigger,
                    open && styles.triggerOpen,
                    disabled && styles.triggerDisabled,
                ]}
                onPress={() => !disabled && setOpen(true)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.triggerText,
                        isPlaceholder && styles.triggerPlaceholder,
                        disabled && styles.triggerTextDisabled,
                    ]}
                    numberOfLines={1}
                >
                    {displayLabel}
                </Text>
                <FontAwesome5
                    name={open ? "chevron-up" : "chevron-down"}
                    size={12}
                    color={disabled ? theme.colors.textTertiary : theme.colors.textSecondary}
                />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="none"
                onRequestClose={handleClose}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.overlay}>
                        <Animated.View
                            style={[
                                styles.dropdownCard,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [20, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.dropdownHandle} />

                            <FlatList
                                data={options}
                                keyExtractor={(item, idx) => String(item.value ?? idx)}
                                style={styles.list}
                                bounces={false}
                                renderItem={({ item, index }) => {
                                    const isSelected = item.value === selectedValue;
                                    const isLast = index === options.length - 1;
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.option,
                                                isSelected && styles.optionSelected,
                                                !isLast && styles.optionBorder,
                                            ]}
                                            onPress={() => handleSelect(item.value)}
                                            activeOpacity={0.6}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    isSelected && styles.optionTextSelected,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                            {isSelected && (
                                                <FontAwesome5
                                                    name="check"
                                                    size={14}
                                                    color={theme.colors.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
