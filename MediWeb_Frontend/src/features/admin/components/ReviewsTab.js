import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { useResponsiveLayout } from 'hooks/useResponsiveLayout';
import ResponsiveContainer from 'components/ui/ResponsiveContainer';
import { createStyles } from '../AdminScreen.style';
import {
    getAdminReviews, checkReview, deleteReview, getReportedReviews, dismissReport,
} from '../admin.api';
import { LoadingView, AdminPagination } from './AdminShared';
import { REASON_LABELS } from './reasonLabels';

// ════════════════════════════════════════════════════════
//  REVIEWS TAB
// ════════════════════════════════════════════════════════

const FILTERS = [
    { key: 'unchecked', label: 'Ellenőrizetlen' },
    { key: 'checked', label: 'Ellenőrzött' },
    { key: 'all', label: 'Összes' },
];

export default function ReviewsTab() {
    const { theme } = useTheme();
    const { isMobile } = useResponsiveLayout();
    const styles = useMemo(() => createStyles(theme, { isMobile }), [theme, isMobile]);
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

    return (
        <ScrollView style={styles.content}>
            <ResponsiveContainer padded={false} style={styles.contentInner}>
                <Text style={styles.sectionTitle}>Értékelés moderáció</Text>

                {/* Filter Tabs */}
                <View style={styles.filterRow}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                            onPress={() => { setFilter(f.key); setPage(0); }}
                            accessibilityRole="button"
                            accessibilityLabel={f.label}
                            accessibilityState={{ selected: filter === f.key }}
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
                    accessibilityRole="button"
                    accessibilityLabel="Bejelentett értékelések"
                    accessibilityState={{ expanded: showReported }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <FontAwesome5 name="flag" size={14} color={showReported ? theme.colors.white : theme.colors.error} />
                        <Text style={[styles.reportedHeaderText, showReported && { color: theme.colors.white }]}>
                            Bejelentett értékelések
                        </Text>
                    </View>
                    <FontAwesome5 name={showReported ? 'chevron-up' : 'chevron-down'} size={12}
                        color={showReported ? theme.colors.white : theme.colors.textTertiary} />
                </TouchableOpacity>

                {showReported && (
                    <View style={styles.reportedSection}>
                        {reportedLoading ? <LoadingView /> : reported.length === 0 ? (
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
                                            <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Bejelentés elutasítása" onPress={() => handleDismiss(report.reportId)}>
                                                <FontAwesome5 name="times-circle" size={12} color={theme.colors.info} />
                                                <Text style={[styles.actionBtnText, { color: theme.colors.info }]}>Elutasítás</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Értékelés törlése" onPress={() => handleDelete(report.reviewId)}>
                                                <FontAwesome5 name="trash" size={12} color={theme.colors.error} />
                                                <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>Értékelés törlése</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                <AdminPagination page={reportedPage} totalPages={reportedTotalPages} onChange={setReportedPage} />
                            </>
                        )}
                    </View>
                )}

                {/* ── Regular Reviews ── */}
                <Text style={[styles.subsectionTitle, { marginTop: 20 }]}>Összes értékelés</Text>

                {loading ? <LoadingView /> : (
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
                                        <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Megjelölés ellenőrzöttként" onPress={() => handleCheck(review.id)}>
                                            <FontAwesome5 name="check" size={12} color={theme.colors.success} />
                                            <Text style={[styles.actionBtnText, { color: theme.colors.success }]}>Ellenőrzött</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Értékelés törlése" onPress={() => handleDelete(review.id)}>
                                        <FontAwesome5 name="trash" size={12} color={theme.colors.error} />
                                        <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>Törlés</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
                    </>
                )}
            </ResponsiveContainer>
        </ScrollView>
    );
}
