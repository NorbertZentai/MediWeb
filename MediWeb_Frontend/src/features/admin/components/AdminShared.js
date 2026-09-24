import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { createStyles } from '../AdminScreen.style';

// ────────── Shared Components ──────────

export function LoadingView() {
    const { theme } = useTheme();
    return (
        <View testID="admin-loading" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
}

export function SyncStatBadge({ label, value, color }) {
    const { theme } = useTheme();
    return (
        <View style={{ alignItems: 'center', minWidth: 60 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color }}>{value}</Text>
            <Text style={{ fontSize: 11, color: theme.colors.textTertiary, marginTop: 2 }}>{label}</Text>
        </View>
    );
}

export function AdminPagination({ page, totalPages, onChange }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    if (totalPages <= 1) return null;

    const prevDisabled = page === 0;
    const nextDisabled = page >= totalPages - 1;

    return (
        <View style={styles.pagination}>
            <TouchableOpacity
                style={[styles.pageBtn, prevDisabled && styles.pageBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Előző oldal"
                accessibilityState={{ disabled: prevDisabled }}
                onPress={() => onChange(Math.max(0, page - 1))}
                disabled={prevDisabled}
            >
                <FontAwesome5 name="chevron-left" size={12} color={prevDisabled ? theme.colors.textTertiary : theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.pageText}>{`${page + 1} / ${totalPages}`}</Text>
            <TouchableOpacity
                style={[styles.pageBtn, nextDisabled && styles.pageBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Következő oldal"
                accessibilityState={{ disabled: nextDisabled }}
                onPress={() => onChange(Math.min(totalPages - 1, page + 1))}
                disabled={nextDisabled}
            >
                <FontAwesome5 name="chevron-right" size={12} color={nextDisabled ? theme.colors.textTertiary : theme.colors.primary} />
            </TouchableOpacity>
        </View>
    );
}
