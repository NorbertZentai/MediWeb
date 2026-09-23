import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import ResponsiveContainer from 'components/ui/ResponsiveContainer';
import { createStyles } from '../AdminScreen.style';
import {
    getSyncConfig, updateSyncConfig, getSyncStatus, startSync, stopSync, startImageSync,
} from '../admin.api';
import { LoadingView, SyncStatBadge } from './AdminShared';

// ════════════════════════════════════════════════════════
//  SYNC TAB
// ════════════════════════════════════════════════════════

const CONFIG_FIELDS = [
    { key: 'parallelism', label: 'Párhuzamosság (szálak)', type: 'number' },
    { key: 'delayMs', label: 'Késleltetés (ms)', type: 'number' },
    { key: 'skipRecentDays', label: 'Friss kihagyás (napok)', type: 'number' },
    { key: 'averageSecondsPerItem', label: 'Átlag mp/tétel', type: 'decimal' },
    { key: 'discoveryLimit', label: 'Felfedezési limit (-1 = korlátlan)', type: 'number' },
    { key: 'persistenceChunkSize', label: 'Mentési csomag méret', type: 'number' },
];

export default function SyncTab() {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [syncStatus, setSyncStatus] = useState(null);
    const [config, setConfig] = useState(null);
    const [editConfig, setEditConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    if (loading) return <LoadingView />;

    const isRunning = syncStatus?.running;
    const progressPercent = syncStatus?.totalKnown > 0
        ? Math.round((syncStatus.processed / syncStatus.totalKnown) * 100)
        : 0;

    return (
        <ScrollView style={styles.content}>
            <ResponsiveContainer padded={false} style={styles.contentInner}>
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
                                <SyncStatBadge label="Sikeres" value={syncStatus.succeeded} color={theme.colors.success} />
                                <SyncStatBadge label="Hibás" value={syncStatus.failed} color={theme.colors.error} />
                                <SyncStatBadge label="Kihagyott" value={syncStatus.skipped} color={theme.colors.warning} />
                                <SyncStatBadge label="Tárolt" value={syncStatus.totalPersisted} color={theme.colors.info} />
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
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Szinkron indítás" style={[styles.syncBtn, { backgroundColor: theme.colors.primary }]} onPress={() => handleStartSync(false)}>
                                <FontAwesome5 name="play" size={14} color="#fff" />
                                <Text style={styles.syncBtnText}>Szinkron indítás</Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Kényszerített" style={[styles.syncBtn, { backgroundColor: theme.colors.warning }]} onPress={() => handleStartSync(true)}>
                                <FontAwesome5 name="redo" size={14} color="#fff" />
                                <Text style={styles.syncBtnText}>Kényszerített</Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Hiányzó képek" style={[styles.syncBtn, { backgroundColor: theme.colors.info }]} onPress={() => handleImageSync(false, false)}>
                                <FontAwesome5 name="image" size={14} color="#fff" />
                                <Text style={styles.syncBtnText}>Hiányzó képek</Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Képek + cleanup" style={[styles.syncBtn, { backgroundColor: theme.colors.secondary }]} onPress={() => handleImageSync(false, true)}>
                                <FontAwesome5 name="broom" size={14} color="#fff" />
                                <Text style={styles.syncBtnText}>Képek + cleanup</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Leállítás" style={[styles.syncBtn, { backgroundColor: theme.colors.error }]} onPress={handleStopSync}>
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
                        accessibilityRole="button"
                        accessibilityLabel="Beállítások mentése"
                        accessibilityState={{ disabled: saving }}
                        style={[styles.saveConfigBtn, saving && { opacity: 0.5 }]}
                        onPress={handleSaveConfig}
                        disabled={saving}
                    >
                        <FontAwesome5 name="save" size={14} color="#fff" />
                        <Text style={styles.saveConfigBtnText}>{saving ? 'Mentés...' : 'Beállítások mentése'}</Text>
                    </TouchableOpacity>
                </View>
            </ResponsiveContainer>
        </ScrollView>
    );
}
