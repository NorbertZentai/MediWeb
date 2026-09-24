import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { useResponsiveLayout } from 'hooks/useResponsiveLayout';
import ResponsiveContainer from 'components/ui/ResponsiveContainer';
import { createStyles } from '../AdminScreen.style';
import { getAdminDashboard } from '../admin.api';
import { LoadingView } from './AdminShared';

// ════════════════════════════════════════════════════════
//  DASHBOARD TAB
// ════════════════════════════════════════════════════════

export default function DashboardTab() {
    const { theme } = useTheme();
    const { isMobile } = useResponsiveLayout();
    const styles = useMemo(() => createStyles(theme, { isMobile }), [theme, isMobile]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminDashboard();
            setStats(data);
        } catch (e) {
            console.error('Dashboard load error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    if (loading) return <LoadingView />;

    const cards = [
        { label: 'Összes felhasználó', value: stats?.totalUsers ?? 0, icon: 'users', color: theme.colors.info },
        { label: 'Aktív felhasználók', value: stats?.activeUsers ?? 0, icon: 'user-check', color: theme.colors.success },
        { label: 'Gyógyszerek', value: stats?.totalMedications ?? 0, icon: 'pills', color: theme.colors.primary },
        { label: 'Értékelések', value: stats?.totalReviews ?? 0, icon: 'star', color: theme.colors.warning },
        { label: 'Ellenőrizetlen', value: stats?.uncheckedReviews ?? 0, icon: 'exclamation-circle', color: theme.colors.error },
        { label: 'Bejelentett', value: stats?.reportedReviews ?? 0, icon: 'flag', color: '#e74c3c' },
    ];

    return (
        <ScrollView
            style={styles.content}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} tintColor={theme.colors.primary} />}
        >
            <ResponsiveContainer padded={false} style={styles.contentInner}>
                <Text style={styles.sectionTitle}>Áttekintés</Text>
                <View style={styles.cardsGrid}>
                    {cards.map((card, i) => (
                        <View key={i} testID={`admin-stat-card-${i}`} style={styles.statCard}>
                            <View style={[styles.statIconWrap, { backgroundColor: card.color + '18' }]}>
                                <FontAwesome5 name={card.icon} size={20} color={card.color} />
                            </View>
                            <Text style={styles.statValue}>{card.value.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>{card.label}</Text>
                        </View>
                    ))}
                </View>
            </ResponsiveContainer>
        </ScrollView>
    );
}
