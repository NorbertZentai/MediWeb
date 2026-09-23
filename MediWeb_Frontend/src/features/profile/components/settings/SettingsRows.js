import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { MIN_TOUCH_TARGET } from 'styles/theme';

// Shared row primitives extracted from SettingsTab.js (issue #77), used by
// NotificationSettingsSection and GeneralSettingsSection.

export function ToggleRow({ title, helper, value, onValueChange, theme, styles }) {
    return (
        <View style={[styles.fieldRow, { minHeight: MIN_TOUCH_TARGET }]}>
            <View style={styles.fieldTextWrapper}>
                <Text style={styles.fieldLabel}>{title}</Text>
                {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
            </View>
            <View style={styles.switchWrapper}>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    accessibilityRole="switch"
                    accessibilityLabel={title}
                    accessibilityState={{ checked: value }}
                    trackColor={{ false: theme.colors.border || theme.colors.borderDark, true: theme.colors.secondary }}
                    thumbColor={value ? theme.colors.secondaryDark || theme.colors.primary : theme.colors.background}
                    ios_backgroundColor={theme.colors.border || theme.colors.borderDark}
                />
            </View>
        </View>
    );
}

export function PillGroup({
    title,
    helper,
    options,
    value,
    onSelect,
    theme,
    styles,
    disabled = false,
    infoText,
}) {
    return (
        <View style={styles.fieldColumn}>
            <View>
                <Text style={styles.fieldLabel}>{title}</Text>
                {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
            </View>
            <View style={styles.pillGroup}>
                {options.map((option) => {
                    const isActive = value === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.pill,
                                isActive && styles.pillActive,
                                disabled && styles.pillDisabled,
                                { minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={option.label}
                            accessibilityState={{ selected: isActive, disabled }}
                            onPress={() => {
                                if (disabled) {
                                    return;
                                }
                                onSelect(option.value);
                            }}
                            activeOpacity={disabled ? 1 : 0.7}
                        >
                            <Text
                                style={[styles.pillLabel, isActive && styles.pillLabelActive]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {infoText ? <Text style={styles.comingSoonText}>{infoText}</Text> : null}
        </View>
    );
}
