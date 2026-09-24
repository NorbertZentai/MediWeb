import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { useResponsiveLayout } from 'hooks/useResponsiveLayout';
import { createStyles } from './AdminScreen.style';
import DashboardTab from './components/DashboardTab';
import UsersTab from './components/UsersTab';
import ReviewsTab from './components/ReviewsTab';
import SyncTab from './components/SyncTab';

// ════════════════════════════════════════════════════════
//  ADMIN SCREEN — Main container with tab navigation
// ════════════════════════════════════════════════════════

const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: 'chart-bar' },
    { key: 'users', label: 'Felhasználók', icon: 'users' },
    { key: 'reviews', label: 'Értékelések', icon: 'star' },
    { key: 'sync', label: 'Szinkron', icon: 'sync-alt' },
];

export default function AdminScreen() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { theme } = useTheme();
    const { isMobile } = useResponsiveLayout();
    const styles = useMemo(() => createStyles(theme, { isMobile }), [theme, isMobile]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Tab Bar */}
            <View style={styles.tabBar} accessible accessibilityRole="tablist">
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                        accessibilityRole="tab"
                        accessibilityLabel={tab.label}
                        accessibilityState={{ selected: activeTab === tab.key }}
                        activeOpacity={0.7}
                    >
                        <FontAwesome5
                            name={tab.icon}
                            size={16}
                            color={activeTab === tab.key ? theme.colors.primary : theme.colors.textTertiary}
                        />
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'sync' && <SyncTab />}
        </SafeAreaView>
    );
}
