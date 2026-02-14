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
    findNodeHandle,
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
    const triggerRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const selectedOption = options.find((o) => o.value === selectedValue);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;
    const isPlaceholder = !selectedOption;

    const handleSelect = (value) => {
        onValueChange(value);
        setOpen(false);
    };

    const handleClose = () => {
        if (Platform.OS === "web") {
            setOpen(false);
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => setOpen(false));
        }
    };

    // Web custom dropdown (positioned below trigger)
    if (Platform.OS === "web") {
        // We need ReactDOM for portals
        const ReactDOM = require("react-dom");

        const updatePosition = () => {
            if (triggerRef.current && open) {
                let node = triggerRef.current;
                // Resolve to DOM node
                if (node && !node.getBoundingClientRect) {
                    try {
                        node = findNodeHandle(node);
                    } catch (err) {
                        console.warn("Could not find node handle", err);
                    }
                }

                if (node && node.getBoundingClientRect) {
                    const rect = node.getBoundingClientRect();
                    // Calculate absolute position including scroll
                    const scrollX = window.scrollX || window.pageXOffset;
                    const scrollY = window.scrollY || window.pageYOffset;

                    setDropdownPosition({
                        top: rect.bottom + scrollY + 4,
                        left: rect.left + scrollX,
                        width: rect.width,
                    });
                }
            }
        };

        // Update position on scroll/resize
        useEffect(() => {
            if (open) {
                updatePosition();
                window.addEventListener("scroll", updatePosition, true);
                window.addEventListener("resize", updatePosition);
                return () => {
                    window.removeEventListener("scroll", updatePosition, true);
                    window.removeEventListener("resize", updatePosition);
                };
            }
        }, [open]);

        const handleToggle = () => {
            if (!disabled) {
                if (!open) {
                    setOpen(true);
                    // Defer measurement to next frame to ensure render
                    requestAnimationFrame(updatePosition);
                } else {
                    setOpen(false);
                }
            }
        };

        const dropdownMenu = (
            <div
                style={{
                    position: "absolute",
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    maxHeight: 300,
                    backgroundColor: theme.colors.backgroundCard,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1.5,
                    borderColor: theme.colors.border,
                    borderStyle: "solid",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    overflowY: "auto",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {options.map((item, index) => {
                    const isSelected = item.value === selectedValue;
                    const isLast = index === options.length - 1;
                    return (
                        <div
                            key={String(item.value ?? index)}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(item.value);
                            }}
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 16px",
                                backgroundColor: isSelected ? (theme.colors.primaryLight || theme.colors.primaryMuted) : "transparent",
                                borderBottom: !isLast ? `1px solid ${theme.colors.divider}` : "none",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = theme.colors.backgroundElevated;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }
                            }}
                        >
                            <span style={{
                                fontSize: theme.fontSize.base,
                                color: isSelected ? theme.colors.primary : theme.colors.textPrimary,
                                fontWeight: isSelected ? theme.fontWeight.semibold : theme.fontWeight.normal,
                                flex: 1,
                                fontFamily: "System", // System font stack
                            }}>
                                {item.label}
                            </span>
                            {isSelected && (
                                <FontAwesome5
                                    name="check"
                                    size={14}
                                    color={theme.colors.primary}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        );

        return (
            <View
                ref={triggerRef}
                style={[styles.container, style]}
            >
                <TouchableOpacity
                    style={[
                        styles.trigger,
                        open && styles.triggerOpen,
                        disabled && styles.triggerDisabled,
                    ]}
                    onPress={handleToggle}
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

                {open && ReactDOM.createPortal(
                    <>
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 9998,
                                cursor: "default",
                            }}
                            onClick={handleClose}
                        />
                        {dropdownMenu}
                    </>,
                    document.body
                )}
            </View>
        );
    }

    useEffect(() => {
        if (Platform.OS !== "web" && open) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else if (Platform.OS !== "web") {
            fadeAnim.setValue(0);
        }
    }, [open]);

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
