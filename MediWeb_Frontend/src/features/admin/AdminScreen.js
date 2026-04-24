import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
    ActivityIndicator, Alert, Platform, RefreshControl
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { AuthContext } from 'contexts/AuthContext';
import {
    getAdminDashboard, getAdminUsers, updateUserRole, toggleUserActive,
    deleteAdminUser, getAdminReviews, checkReview, deleteReview,
    getReportedReviews, dismissReport,
    getSyncConfig, updateSyncConfig, getSyncStatus, startSync, stopSync, startImageSync,
} from './admin.api';

const REASON_LABELS = {
    SPAM: 'Spam vagy hirdetés',
    INAPPROPRIATE: 'Nem megfelelő tartalom',
    MISLEADING: 'Félrevezető információ',
    OFFENSIVE: 'Sértő / bántó nyelvezet',
    OTHER: 'Egyéb',
};

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
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
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
            {activeTab === 'dashboard' && <DashboardTab theme={theme} />}
            {activeTab === 'users' && <UsersTab theme={theme} />}
            {activeTab === 'reviews' && <ReviewsTab theme={theme} />}
            {activeTab === 'sync' && <SyncTab theme={theme} />}
        </View>
    );
}

// ════════════════════════════════════════════════════════
//  DASHBOARD TAB
// ════════════════════════════════════════════════════════

function DashboardTab({ theme }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const styles = useMemo(() => createStyles(theme), [theme]);

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

    if (loading) return <LoadingView theme={theme} />;

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
            contentContainerStyle={styles.contentInner}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} tintColor={theme.colors.primary} />}
        >
            <Text style={styles.sectionTitle}>Áttekintés</Text>
            <View style={styles.cardsGrid}>
                {cards.map((card, i) => (
                    <View key={i} style={styles.statCard}>
                        <View style={[styles.statIconWrap, { backgroundColor: card.color + '18' }]}>
                            <FontAwesome5 name={card.icon} size={20} color={card.color} />
                        </View>
                        <Text style={styles.statValue}>{card.value.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>{card.label}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

// ════════════════════════════════════════════════════════
//  USERS TAB
// ════════════════════════════════════════════════════════

function UsersTab({ theme }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const styles = useMemo(() => createStyles(theme), [theme]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminUsers({ search, page, size: 15 });
            setUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            console.error('Users load error:', e);
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            loadUsers();
        } catch (e) {
            Alert.alert('Hiba', 'Nem sikerült módosítani a szerepkört.');
        }
    };

    const handleToggleActive = async (userId, active) => {
        try {
            await toggleUserActive(userId, active);
            loadUsers();
        } catch (e) {
            Alert.alert('Hiba', 'Nem sikerült módosítani az állapotot.');
        }
    };

    const handleDelete = (userId, userName) => {
        const doDelete = async () => {
            try {
                await deleteAdminUser(userId);
                loadUsers();
            } catch (e) {
                Alert.alert('Hiba', 'Nem sikerült törölni a felhasználót.');
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(`Biztosan törlöd a(z) "${userName}" felhasználót?`)) doDelete();
        } else {
            Alert.alert('Törlés', `Biztosan törlöd a(z) "${userName}" felhasználót?`, [
                { text: 'Mégse', style: 'cancel' },
                { text: 'Törlés', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <Text style={styles.sectionTitle}>Felhasználókezelés</Text>

            {/* Search */}
            <View style={styles.searchRow}>
                <FontAwesome5 name="search" size={14} color={theme.colors.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Keresés név vagy email alapján..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={search}
                    onChangeText={(val) => { setSearch(val); setPage(0); }}
                />
            </View>

            {loading ? <LoadingView theme={theme} /> : (
                <>
                    {users.map(user => (
                        <View key={user.id} style={styles.userCard}>
                            <View style={styles.userHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.userName}>{user.name}</Text>
                                    <Text style={styles.userEmail}>{user.email}</Text>
                                </View>
                                <View style={[styles.roleBadge, user.role === 'ADMIN' && styles.roleBadgeAdmin]}>
                                    <Text style={[styles.roleBadgeText, user.role === 'ADMIN' && styles.roleBadgeTextAdmin]}>
                                        {user.role}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.userMeta}>
                                <View style={styles.metaItem}>
                                    <FontAwesome5 name="calendar-plus" size={11} color={theme.colors.textTertiary} />
                                    <Text style={styles.metaText}>Regisztráció: {formatDate(user.registrationDate)}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <FontAwesome5 name="clock" size={11} color={theme.colors.textTertiary} />
                                    <Text style={styles.metaText}>Utolsó belépés: {formatDate(user.lastLogin)}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <FontAwesome5 name="circle" size={8} color={user.isActive ? theme.colors.success : theme.colors.error} solid />
                                    <Text style={styles.metaText}>{user.isActive ? 'Aktív' : 'Inaktív'}</Text>
                                </View>
                            </View>

                            <View style={styles.userActions}>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => handleRoleChange(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                >
                                    <FontAwesome5 name="user-shield" size={12} color={theme.colors.info} />
                                    <Text style={[styles.actionBtnText, { color: theme.colors.info }]}>
                                        {user.role === 'ADMIN' ? '→ User' : '→ Admin'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => handleToggleActive(user.id, !user.isActive)}
                                >
                                    <FontAwesome5 name={user.isActive ? 'ban' : 'check'} size={12} color={theme.colors.warning} />
                                    <Text style={[styles.actionBtnText, { color: theme.colors.warning }]}>
                                        {user.isActive ? 'Tiltás' : 'Aktiválás'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => handleDelete(user.id, user.name)}
                                >
                                    <FontAwesome5 name="trash" size={12} color={theme.colors.error} />
                                    <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>Törlés</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                                onPress={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                            >
                                <FontAwesome5 name="chevron-left" size={12} color={page === 0 ? theme.colors.textTertiary : theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.pageText}>{page + 1} / {totalPages}</Text>
                            <TouchableOpacity
                                style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]}
                                onPress={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                <FontAwesome5 name="chevron-right" size={12} color={page >= totalPages - 1 ? theme.colors.textTertiary : theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
}

// ════════════════════════════════════════════════════════
//  REVIEWS TAB
// ════════════════════════════════════════════════════════

function ReviewsTab({ theme }) {
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('unchecked');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reported, setReported] = useState([]);
    const [reportedPage, setReportedPage] = useState(0);
    const [reportedTotalPages, setReportedTotalPages] = useState(0);
    const [reportedLoading, setReportedLoading] = useState(false);
    const [showReported, setShowReported] = useState(false);
    const styles = useMemo(() => createStyles(theme), [theme]);

    const loadReviews = useCallback(async () => {
        try {
            setLoading(true);
            const checked = filter === 'unchecked' ? false : filter === 'checked' ? true : undefined;
            const data = await getAdminReviews({ checked, page, size: 15 });
            setReviews(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            console.error('Reviews load error:', e);
        } finally {
            setLoading(false);
        }
    }, [filter, page]);

    const loadReported = useCallback(async () => {
        try {
            setReportedLoading(true);
            const data = await getReportedReviews({ page: reportedPage, size: 10 });
            setReported(data.content || []);
            setReportedTotalPages(data.totalPages || 0);
        } catch (e) {
            console.error('Reported reviews load error:', e);
        } finally {
            setReportedLoading(false);
        }
    }, [reportedPage]);

    useEffect(() => { loadReviews(); }, [loadReviews]);
    useEffect(() => { if (showReported) loadReported(); }, [showReported, loadReported]);

    const handleCheck = async (reviewId) => {
        try { await checkReview(reviewId); loadReviews(); }
        catch (e) { Alert.alert('Hiba', 'Nem sikerült ellenőrizni az értékelést.'); }
    };

    const handleDelete = (reviewId) => {
        const doDelete = async () => {
            try { await deleteReview(reviewId); loadReviews(); loadReported(); }
            catch (e) { Alert.alert('Hiba', 'Nem sikerült törölni az értékelést.'); }
        };
        if (Platform.OS === 'web') {
            if (window.confirm('Biztosan törlöd ezt az értékelést?')) doDelete();
        } else {
            Alert.alert('Törlés', 'Biztosan törlöd ezt az értékelést?', [
                { text: 'Mégse', style: 'cancel' },
                { text: 'Törlés', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const handleDismiss = async (reportId) => {
        try { await dismissReport(reportId); loadReported(); }
        catch (e) { Alert.alert('Hiba', 'Nem sikerült elutasítani a bejelentést.'); }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FontAwesome5 key={i} name="star" size={12} solid={i < rating}
                color={i < rating ? theme.colors.warning : theme.colors.border}
                style={{ marginRight: 2 }} />
        ));
    };

    const FILTERS = [
        { key: 'unchecked', label: 'Ellenőrizetlen' },
        { key: 'checked', label: 'Ellenőrzött' },
        { key: 'all', label: 'Összes' },
    ];

    return (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <Text style={styles.sectionTitle}>Értékelés moderáció</Text>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                        onPress={() => { setFilter(f.key); setPage(0); }}
                    >
                        <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Reported Reviews Section ── */}
            <TouchableOpacity
                style={[styles.reportedHeader, showReported && styles.reportedHeaderActive]}
                onPress={() => setShowReported(!showReported)}
                activeOpacity={0.7}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <FontAwesome5 name="flag" size={14} color={showReported ? '#fff' : theme.colors.error} />
                    <Text style={[styles.reportedHeaderText, showReported && { color: '#fff' }]}>
                        Bejelentett értékelések
                    </Text>
                </View>
                <FontAwesome5 name={showReported ? 'chevron-up' : 'chevron-down'} size={12}
                    color={showReported ? '#fff' : theme.colors.textTertiary} />
            </TouchableOpacity>

            {showReported && (
                <View style={styles.reportedSection}>
                    {reportedLoading ? <LoadingView theme={theme} /> : reported.length === 0 ? (
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="check-circle" size={28} color={theme.colors.success} />
                            <Text style={styles.emptyText}>Nincs bejelentett értékelés</Text>
                        </View>
                    ) : (
                        <>
                            {reported.map(report => (
                                <View key={report.reportId} style={styles.reportCard}>
                                    {/* Report reason badge */}
                                    <View style={styles.reportReasonRow}>
                                        <View style={styles.reportReasonBadge}>
                                            <FontAwesome5 name="flag" size={10} color={theme.colors.error} />
                                            <Text style={styles.reportReasonText}>
                                                {REASON_LABELS[report.reason] || report.reason}
                                            </Text>
                                        </View>
                                        {report.totalReports > 1 && (
                                            <View style={[styles.reportReasonBadge, { backgroundColor: theme.colors.warning + '18' }]}>
                                                <Text style={[styles.reportReasonText, { color: theme.colors.warning }]}>
                                                    {report.totalReports}× bejelentve
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Reporter info */}
                                    <Text style={styles.reporterInfo}>
                                        Bejelentő: {report.reporterName} • {new Date(report.reportedAt).toLocaleDateString('hu-HU')}
                                    </Text>
                                    {report.comment && (
                                        <Text style={styles.reportComment}>"{report.comment}"</Text>
                                    )}

                                    {/* Review content */}
                                    <View style={styles.reportedReviewContent}>
                                        <Text style={styles.reviewMedName}>{report.medicationName}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 6 }}>
                                            {renderStars(report.rating)}
                                            <Text style={styles.reviewAuthor}> — {report.reviewAuthor}</Text>
                                        </View>
                                        {report.positive && (
                                            <View style={styles.reviewTextRow}>
                                                <FontAwesome5 name="thumbs-up" size={11} color={theme.colors.success} />
                                                <Text style={styles.reviewText}>{report.positive}</Text>
                                            </View>
                                        )}
                                        {report.negative && (
                                            <View style={styles.reviewTextRow}>
                                                <FontAwesome5 name="thumbs-down" size={11} color={theme.colors.error} />
                                                <Text style={styles.reviewText}>{report.negative}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Actions */}
                                    <View style={styles.reviewActions}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDismiss(report.reportId)}>
                                            <FontAwesome5 name="times-circle" size={12} color={theme.colors.info} />
                                            <Text style={[styles.actionBtnText, { color: theme.colors.info }]}>Elutasítás</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(report.reviewId)}>
                                            <FontAwesome5 name="trash" size={12} color={theme.colors.error} />
                                            <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>Értékelés törlése</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            {reportedTotalPages > 1 && (
                                <View style={styles.pagination}>
                                    <TouchableOpacity
                                        style={[styles.pageBtn, reportedPage === 0 && styles.pageBtnDisabled]}
                                        onPress={() => setReportedPage(Math.max(0, reportedPage - 1))}
                                        disabled={reportedPage === 0}
                                    >
                                        <FontAwesome5 name="chevron-left" size={12}
                                            color={reportedPage === 0 ? theme.colors.textTertiary : theme.colors.primary} />
                                    </TouchableOpacity>
                                    <Text style={styles.pageText}>{reportedPage + 1} / {reportedTotalPages}</Text>
                                    <TouchableOpacity
                                        style={[styles.pageBtn, reportedPage >= reportedTotalPages - 1 && styles.pageBtnDisabled]}
                                        onPress={() => setReportedPage(Math.min(reportedTotalPages - 1, reportedPage + 1))}
                                        disabled={reportedPage >= reportedTotalPages - 1}
                                    >
                                        <FontAwesome5 name="chevron-right" size={12}
                                            color={reportedPage >= reportedTotalPages - 1 ? theme.colors.textTertiary : theme.colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </View>
            )}

            {/* ── Regular Reviews ── */}
            <Text style={[styles.subsectionTitle, { marginTop: 20 }]}>Összes értékelés</Text>

            {loading ? <LoadingView theme={theme} /> : (
                <>
                    {reviews.length === 0 && (
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="check-circle" size={32} color={theme.colors.success} />
                            <Text style={styles.emptyText}>Nincs {filter === 'unchecked' ? 'ellenőrizetlen' : ''} értékelés</Text>
                        </View>
                    )}

                    {reviews.map(review => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.reviewMedName}>{review.medicationName}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                        {renderStars(review.rating)}
                                        <Text style={styles.reviewAuthor}> — {review.author}</Text>
                                    </View>
                                </View>
                                {review.checked && (
                                    <FontAwesome5 name="check-circle" size={16} color={theme.colors.success} solid />
                                )}
                                {review.reported && (
                                    <FontAwesome5 name="flag" size={14} color={theme.colors.error} style={{ marginLeft: 8 }} />
                                )}
                            </View>

                            {review.positive && (
                                <View style={styles.reviewTextRow}>
                                    <FontAwesome5 name="thumbs-up" size={11} color={theme.colors.success} />
                                    <Text style={styles.reviewText}>{review.positive}</Text>
                                </View>
                            )}
                            {review.negative && (
                                <View style={styles.reviewTextRow}>
                                    <FontAwesome5 name="thumbs-down" size={11} color={theme.colors.error} />
                                    <Text style={styles.reviewText}>{review.negative}</Text>
                                </View>
                            )}

                            <View style={styles.reviewActions}>
                                {!review.checked && (
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleCheck(review.id)}>
                                        <FontAwesome5 name="check" size={12} color={theme.colors.success} />
                                        <Text style={[styles.actionBtnText, { color: theme.colors.success }]}>Ellenőrzött</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(review.id)}>
                                    <FontAwesome5 name="trash" size={12} color={theme.colors.error} />
                                    <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>Törlés</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {totalPages > 1 && (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                                onPress={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                            >
                                <FontAwesome5 name="chevron-left" size={12} color={page === 0 ? theme.colors.textTertiary : theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.pageText}>{page + 1} / {totalPages}</Text>
                            <TouchableOpacity
                                style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]}
                                onPress={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                <FontAwesome5 name="chevron-right" size={12} color={page >= totalPages - 1 ? theme.colors.textTertiary : theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
}

// ════════════════════════════════════════════════════════
//  SYNC TAB
// ════════════════════════════════════════════════════════

function SyncTab({ theme }) {
    const [syncStatus, setSyncStatus] = useState(null);
    const [config, setConfig] = useState(null);
    const [editConfig, setEditConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const styles = useMemo(() => createStyles(theme), [theme]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [statusData, configData] = await Promise.all([getSyncStatus(), getSyncConfig()]);
            setSyncStatus(statusData);
            setConfig(configData);
            if (!editConfig) setEditConfig(configData);
        } catch (e) {
            console.error('Sync load error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Auto-refresh while sync is running
    useEffect(() => {
        if (!syncStatus?.running) return;
        const interval = setInterval(async () => {
            try {
                const data = await getSyncStatus();
                setSyncStatus(data);
            } catch (e) { /* ignore */ }
        }, 3000);
        return () => clearInterval(interval);
    }, [syncStatus?.running]);

    const handleSaveConfig = async () => {
        try {
            setSaving(true);
            const updated = await updateSyncConfig(editConfig);
            setConfig(updated);
            setEditConfig(updated);
            Alert.alert('Siker', 'Beállítások mentve.');
        } catch (e) {
            Alert.alert('Hiba', 'Nem sikerült menteni a beállításokat.');
        } finally {
            setSaving(false);
        }
    };

    const handleStartSync = async (force = false) => {
        try {
            await startSync({ force });
            const data = await getSyncStatus();
            setSyncStatus(data);
        } catch (e) {
            Alert.alert('Hiba', e?.response?.data?.message || 'Nem sikerült elindítani.');
        }
    };

    const handleStopSync = async () => {
        try {
            await stopSync();
            const data = await getSyncStatus();
            setSyncStatus(data);
        } catch (e) {
            Alert.alert('Hiba', 'Nem sikerült leállítani.');
        }
    };

    const handleImageSync = async (force = false, cleanup = false) => {
        try {
            await startImageSync({ force, cleanup });
            const data = await getSyncStatus();
            setSyncStatus(data);
        } catch (e) {
            Alert.alert('Hiba', e?.response?.data?.message || 'Nem sikerült elindítani.');
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds || seconds <= 0) return '—';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}ó ${m}p`;
        if (m > 0) return `${m}p ${s}mp`;
        return `${s}mp`;
    };

    if (loading) return <LoadingView theme={theme} />;

    const isRunning = syncStatus?.running;
    const progressPercent = syncStatus?.totalKnown > 0
        ? Math.round((syncStatus.processed / syncStatus.totalKnown) * 100)
        : 0;

    const CONFIG_FIELDS = [
        { key: 'parallelism', label: 'Párhuzamosság (szálak)', type: 'number' },
        { key: 'delayMs', label: 'Késleltetés (ms)', type: 'number' },
        { key: 'skipRecentDays', label: 'Friss kihagyás (napok)', type: 'number' },
        { key: 'averageSecondsPerItem', label: 'Átlag mp/tétel', type: 'decimal' },
        { key: 'discoveryLimit', label: 'Felfedezési limit (-1 = korlátlan)', type: 'number' },
        { key: 'persistenceChunkSize', label: 'Mentési csomag méret', type: 'number' },
    ];

    return (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <Text style={styles.sectionTitle}>Gyógyszerbázis szinkronizáció</Text>

            {/* Status Card */}
            <View style={styles.syncStatusCard}>
                <View style={styles.syncStatusHeader}>
                    <View style={[styles.syncStatusDot, { backgroundColor: isRunning ? theme.colors.success : theme.colors.textTertiary }]} />
                    <Text style={styles.syncStatusLabel}>
                        {isRunning ? 'Fut' : 'Inaktív'} — {syncStatus?.phase ?? 'IDLE'}
                    </Text>
                </View>

                {isRunning && (
                    <>
                        {/* Progress Bar */}
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.colors.primary }]} />
                        </View>
                        <Text style={styles.syncProgressText}>
                            {syncStatus.processed} / {syncStatus.totalKnown} ({progressPercent}%)
                            {syncStatus.estimatedRemainingSeconds > 0 && ` — Hátralévő: ${formatDuration(syncStatus.estimatedRemainingSeconds)}`}
                        </Text>
                        <Text style={styles.syncMessage} numberOfLines={2}>
                            {syncStatus.lastMessage}
                        </Text>

                        {/* Live stats */}
                        <View style={styles.syncStatsRow}>
                            <SyncStatBadge label="Sikeres" value={syncStatus.succeeded} color={theme.colors.success} theme={theme} />
                            <SyncStatBadge label="Hibás" value={syncStatus.failed} color={theme.colors.error} theme={theme} />
                            <SyncStatBadge label="Kihagyott" value={syncStatus.skipped} color={theme.colors.warning} theme={theme} />
                            <SyncStatBadge label="Tárolt" value={syncStatus.totalPersisted} color={theme.colors.info} theme={theme} />
                        </View>
                    </>
                )}

                {!isRunning && syncStatus?.finishedAt && (
                    <Text style={styles.syncMessage}>
                        Utolsó futás: {new Date(syncStatus.finishedAt).toLocaleString('hu-HU')}
                        {syncStatus.lastMessage ? `\n${syncStatus.lastMessage}` : ''}
                    </Text>
                )}
            </View>

            {/* Sync Actions */}
            <Text style={styles.subsectionTitle}>Műveletek</Text>
            <View style={styles.syncActionsGrid}>
                {!isRunning ? (
                    <>
                        <TouchableOpacity style={[styles.syncBtn, { backgroundColor: theme.colors.primary }]} onPress={() => handleStartSync(false)}>
                            <FontAwesome5 name="play" size={14} color="#fff" />
                            <Text style={styles.syncBtnText}>Szinkron indítás</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.syncBtn, { backgroundColor: theme.colors.warning }]} onPress={() => handleStartSync(true)}>
                            <FontAwesome5 name="redo" size={14} color="#fff" />
                            <Text style={styles.syncBtnText}>Kényszerített</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.syncBtn, { backgroundColor: theme.colors.info }]} onPress={() => handleImageSync(false, false)}>
                            <FontAwesome5 name="image" size={14} color="#fff" />
                            <Text style={styles.syncBtnText}>Hiányzó képek</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.syncBtn, { backgroundColor: theme.colors.secondary }]} onPress={() => handleImageSync(false, true)}>
                            <FontAwesome5 name="broom" size={14} color="#fff" />
                            <Text style={styles.syncBtnText}>Képek + cleanup</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={[styles.syncBtn, { backgroundColor: theme.colors.error }]} onPress={handleStopSync}>
                        <FontAwesome5 name="stop" size={14} color="#fff" />
                        <Text style={styles.syncBtnText}>
                            {syncStatus.cancellationRequested ? 'Leállítás...' : 'Leállítás'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Config Section */}
            <Text style={styles.subsectionTitle}>Beállítások</Text>
            <View style={styles.configCard}>
                {editConfig && CONFIG_FIELDS.map(field => (
                    <View key={field.key} style={styles.configRow}>
                        <Text style={styles.configLabel}>{field.label}</Text>
                        <TextInput
                            style={styles.configInput}
                            value={String(editConfig[field.key] ?? '')}
                            onChangeText={val => {
                                const parsed = field.type === 'decimal' ? parseFloat(val) || 0 : parseInt(val) || 0;
                                setEditConfig(prev => ({ ...prev, [field.key]: parsed }));
                            }}
                            keyboardType="numeric"
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                    </View>
                ))}
                <TouchableOpacity
                    style={[styles.saveConfigBtn, saving && { opacity: 0.5 }]}
                    onPress={handleSaveConfig}
                    disabled={saving}
                >
                    <FontAwesome5 name="save" size={14} color="#fff" />
                    <Text style={styles.saveConfigBtnText}>{saving ? 'Mentés...' : 'Beállítások mentése'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ────────── Shared Components ──────────

function LoadingView({ theme }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
}

function SyncStatBadge({ label, value, color, theme }) {
    return (
        <View style={{ alignItems: 'center', minWidth: 60 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color }}>{value}</Text>
            <Text style={{ fontSize: 11, color: theme.colors.textTertiary, marginTop: 2 }}>{label}</Text>
        </View>
    );
}

// ════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════

function createStyles(theme) {
    const isWeb = Platform.OS === 'web';
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        // ── Tab Bar ──
        tabBar: {
            flexDirection: 'row',
            backgroundColor: theme.colors.backgroundCard,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            paddingHorizontal: 4,
            ...Platform.select({
                web: { position: 'sticky', top: 0, zIndex: 10 },
                default: {},
            }),
        },
        tab: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            gap: 6,
            borderBottomWidth: 2,
            borderBottomColor: 'transparent',
        },
        tabActive: {
            borderBottomColor: theme.colors.primary,
        },
        tabLabel: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.textTertiary,
        },
        tabLabelActive: {
            color: theme.colors.primary,
        },
        // ── Content ──
        content: {
            flex: 1,
        },
        contentInner: {
            padding: isWeb ? 24 : 14,
            maxWidth: isWeb ? 1000 : undefined,
            alignSelf: isWeb ? 'center' : undefined,
            width: isWeb ? '100%' : undefined,
            paddingBottom: isWeb ? 48 : 120, // Extra bottom padding on mobile for tab bar
        },
        sectionTitle: {
            fontSize: 22,
            fontWeight: '700',
            color: theme.colors.textPrimary,
            marginBottom: 16,
        },
        subsectionTitle: {
            fontSize: 17,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginTop: 24,
            marginBottom: 12,
        },
        // ── Dashboard Cards ──
        cardsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        statCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.md,
            padding: 20,
            minWidth: isWeb ? 170 : '46%',
            flex: isWeb ? undefined : 1,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadows.sm,
        },
        statIconWrap: {
            width: 40,
            height: 40,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        statValue: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.textPrimary,
        },
        statLabel: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        // ── Search ──
        searchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: 14,
            marginBottom: 16,
        },
        searchInput: {
            flex: 1,
            paddingVertical: 12,
            fontSize: 14,
            color: theme.colors.textPrimary,
            ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
        },
        // ── User Card ──
        userCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.md,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        userHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        userName: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        userEmail: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginTop: 1,
        },
        roleBadge: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: theme.colors.primaryLight,
        },
        roleBadgeAdmin: {
            backgroundColor: theme.colors.warning + '22',
        },
        roleBadgeText: {
            fontSize: 11,
            fontWeight: '700',
            color: theme.colors.primary,
        },
        roleBadgeTextAdmin: {
            color: theme.colors.warning,
        },
        userMeta: {
            flexDirection: isWeb ? 'row' : 'column',
            flexWrap: 'wrap',
            gap: isWeb ? 12 : 6,
            marginBottom: 12,
        },
        metaItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
        },
        metaText: {
            fontSize: 12,
            color: theme.colors.textTertiary,
        },
        userActions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            paddingTop: 10,
        },
        actionBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 8,
            backgroundColor: theme.colors.backgroundElevated,
        },
        actionBtnText: {
            fontSize: 12,
            fontWeight: '600',
        },
        // ── Pagination ──
        pagination: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            marginTop: 16,
        },
        pageBtn: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.backgroundCard,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        pageBtnDisabled: {
            opacity: 0.4,
        },
        pageText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        // ── Reviews ──
        filterRow: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
        },
        filterBtn: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        filterBtnActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        filterBtnText: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        filterBtnTextActive: {
            color: '#fff',
        },
        reportedHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            backgroundColor: theme.colors.error + '10',
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            borderColor: theme.colors.error + '30',
            marginBottom: 4,
        },
        reportedHeaderActive: {
            backgroundColor: theme.colors.error,
            borderColor: theme.colors.error,
        },
        reportedHeaderText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.error,
        },
        reportedSection: {
            marginBottom: 16,
            borderLeftWidth: 2,
            borderLeftColor: theme.colors.error + '40',
            paddingLeft: 12,
            marginLeft: 4,
            marginTop: 8,
        },
        reportCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.md,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: theme.colors.error + '25',
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.error,
        },
        reportReasonRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 8,
        },
        reportReasonBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: theme.colors.error + '15',
        },
        reportReasonText: {
            fontSize: 11,
            fontWeight: '700',
            color: theme.colors.error,
        },
        reporterInfo: {
            fontSize: 12,
            color: theme.colors.textTertiary,
            marginBottom: 4,
        },
        reportComment: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            marginBottom: 8,
            paddingLeft: 8,
            borderLeftWidth: 2,
            borderLeftColor: theme.colors.border,
        },
        reportedReviewContent: {
            backgroundColor: theme.colors.backgroundElevated,
            borderRadius: theme.borderRadius.sm,
            padding: 12,
            marginBottom: 8,
            marginTop: 4,
        },
        reviewCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.md,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        reviewHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 10,
        },
        reviewMedName: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        reviewAuthor: {
            fontSize: 12,
            color: theme.colors.textTertiary,
        },
        reviewTextRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 6,
        },
        reviewText: {
            flex: 1,
            fontSize: 13,
            color: theme.colors.textSecondary,
            lineHeight: 18,
        },
        reviewActions: {
            flexDirection: 'row',
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            paddingTop: 10,
            marginTop: 4,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 48,
            gap: 12,
        },
        emptyText: {
            fontSize: 15,
            color: theme.colors.textSecondary,
        },
        // ── Sync ──
        syncStatusCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.md,
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        syncStatusHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
        },
        syncStatusDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        syncStatusLabel: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        progressBarBg: {
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.border,
            marginBottom: 8,
            overflow: 'hidden',
        },
        progressBarFill: {
            height: '100%',
            borderRadius: 4,
        },
        syncProgressText: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginBottom: 4,
        },
        syncMessage: {
            fontSize: 12,
            color: theme.colors.textTertiary,
            fontStyle: 'italic',
            marginTop: 4,
        },
        syncStatsRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
        },
        syncActionsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        syncBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: theme.borderRadius.md,
            flex: isWeb ? undefined : 1,
            minWidth: isWeb ? undefined : '45%',
        },
        syncBtnText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: '600',
        },
        // ── Config ──
        configCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.md,
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        configRow: {
            flexDirection: isWeb ? 'row' : 'column',
            alignItems: isWeb ? 'center' : 'flex-start',
            marginBottom: 14,
            gap: isWeb ? 12 : 4,
        },
        configLabel: {
            fontSize: 13,
            fontWeight: '500',
            color: theme.colors.textSecondary,
            minWidth: isWeb ? 220 : undefined,
        },
        configInput: {
            backgroundColor: theme.colors.backgroundElevated,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 14,
            color: theme.colors.textPrimary,
            minWidth: isWeb ? 100 : undefined,
            width: isWeb ? undefined : '100%',
            ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
        },
        saveConfigBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.md,
            paddingVertical: 12,
            marginTop: 8,
        },
        saveConfigBtnText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: '600',
        },
    });
}
