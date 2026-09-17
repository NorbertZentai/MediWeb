import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from 'contexts/ThemeContext';

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
