import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthContext } from 'contexts/AuthContext';
import { createStyles } from './HomeScreen.style';
import { useTheme } from 'contexts/ThemeContext';
import { getHomeDashboard, getPopularMedications } from './home.api';
import { haptics } from 'utils/haptics';
import { getMedicationSyncStatus, startMedicationSync, stopMedicationSync, startImageSync } from 'features/medication/medication.api';

const DEFAULT_DASHBOARD_TEMPLATE = {
  summary: {
    totalMedications: 0,
    remindersToday: 0,
    adherenceRate: null,
    lastSearch: null,
  },
  upcomingReminder: null,
  popularMedications: [],
  todaysMedications: [],
};

const createDefaultDashboard = () => {
  return {
    summary: { ...DEFAULT_DASHBOARD_TEMPLATE.summary },
    upcomingReminder: null,
    popularMedications: [],
    todaysMedications: [],
  };
};

const DEFAULT_SYNC_STATUS = {
  running: false,
  startedAt: null,
  finishedAt: null,
  discovered: 0,
  discoveryScanned: 0,
  discoveryTarget: 0,
  processed: 0,
  succeeded: 0,
  failed: 0,
  skipped: 0,
  totalKnown: 0,
  totalPersisted: 0,
  averageSecondsPerItem: 10,
  parallelism: 1,
  estimatedTotalSeconds: 0,
  estimatedRemainingSeconds: 0,
  phase: 'IDLE',
  discoveryCompleted: true,
  lastMessage: null,
  cancellationRequested: false,
};

const TEST_SYNC_LIMIT = 1000;

import { useResponsiveLayout } from 'hooks/useResponsiveLayout';

export default function HomeScreen() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { isMobile } = useResponsiveLayout();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [dashboard, setDashboard] = useState(() => createDefaultDashboard());
  // ... existing state ...
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [syncStatus, setSyncStatus] = useState(DEFAULT_SYNC_STATUS);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isStartingSync, setIsStartingSync] = useState(false);
  const [isStoppingSync, setIsStoppingSync] = useState(false);
  const [manualSyncError, setManualSyncError] = useState(null);
  const [pendingStartType, setPendingStartType] = useState(null);
  const [isImageSyncStarting, setIsImageSyncStarting] = useState(false);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const status = await getMedicationSyncStatus();
      if (status && typeof status === 'object') {
        setSyncStatus({
          ...DEFAULT_SYNC_STATUS,
          ...status,
          cancellationRequested: Boolean(status?.cancellationRequested),
        });
        setManualSyncError(null);
        return status;
      }
    } catch (statusError) {
      console.error('Gyógyszer adatbázis szinkron státusz lekérdezési hiba:', statusError.message || 'Unknown error');
    }
    return null;
  }, []);

  const loadDashboard = useCallback(
    async (isManualRefresh = false) => {
      if (!user) {
        setDashboard(createDefaultDashboard());
        setErrorMessage(null);
        setSyncStatus({ ...DEFAULT_SYNC_STATUS });
        return;
      }

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        let data = await getHomeDashboard();

        if (!data || typeof data !== 'object') {
          data = createDefaultDashboard();
        }

        if (!data.popularMedications || data.popularMedications.length === 0) {
          try {
            const popular = await getPopularMedications();
            const popularList = Array.isArray(popular)
              ? popular
              : popular?.medications || popular?.data || [];
            data.popularMedications = popularList;
          } catch (popularError) {
            console.warn('Popular medications endpoint is not available yet.', popularError.message || 'Unknown error');
          }
        }

        setDashboard({
          summary: { ...DEFAULT_DASHBOARD_TEMPLATE.summary, ...(data.summary || {}) },
          upcomingReminder: data.upcomingReminder ?? null,
          popularMedications: data.popularMedications ?? [],
          todaysMedications: data.todaysMedications ?? [],
        });
        setErrorMessage(null);
        await fetchSyncStatus();
      } catch (dashboardError) {
        console.error('Dashboard betöltési hiba:', dashboardError.message || 'Unknown error');
        setDashboard(createDefaultDashboard());
        setErrorMessage('Nem sikerült betölteni a vezérlőpult adatait.');
      } finally {
        if (isManualRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [user, fetchSyncStatus]
  );

  useEffect(() => {
    if (!loading) {
      loadDashboard(false);
    }
  }, [loading, loadDashboard]);

  useEffect(() => {
    if (!loading && user) {
      fetchSyncStatus();
    } else if (!user) {
      setSyncStatus({ ...DEFAULT_SYNC_STATUS });
    }
  }, [loading, user, fetchSyncStatus]);

  useEffect(() => {
    if (!syncStatus.running && !syncStatus.cancellationRequested) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchSyncStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, [syncStatus.running, syncStatus.cancellationRequested, fetchSyncStatus]);

  useEffect(() => {
    if (!syncStatus.running || !syncStatus.discoveryCompleted || syncStatus.cancellationRequested) {
      setRemainingSeconds(0);
      return;
    }

    const estimated = Number.isFinite(syncStatus.estimatedRemainingSeconds)
      ? Math.max(Math.round(syncStatus.estimatedRemainingSeconds), 0)
      : 0;
    setRemainingSeconds(estimated);
  }, [syncStatus.running, syncStatus.estimatedRemainingSeconds, syncStatus.cancellationRequested]);

  useEffect(() => {
    if (!syncStatus.running || !syncStatus.discoveryCompleted || syncStatus.cancellationRequested) {
      return undefined;
    }

    const ticker = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(ticker);
  }, [syncStatus.running, syncStatus.discoveryCompleted, syncStatus.cancellationRequested]);

  const isDiscoveryPhase = syncStatus.running && syncStatus.phase === 'ID_DISCOVERY';

  const triggerSync = useCallback(
    async ({ force = false, limit = null, variant = 'standard' } = {}) => {
      if (isStartingSync || isStoppingSync || syncStatus.running || syncStatus.cancellationRequested) {
        return;
      }

      setIsStartingSync(true);
      setPendingStartType(variant);
      setIsStoppingSync(false);
      setManualSyncError(null);
      try {
        const extraParams = {};
        if (limit !== null && limit !== undefined) {
          extraParams.limit = limit;
        }
        await startMedicationSync(force, extraParams);
        const startMessage = limit !== null && limit !== undefined
          ? `Teszt szinkron indítása (${limit} elem)...`
          : 'Szinkron indítása folyamatban...';
        setSyncStatus((prev) => ({
          ...prev,
          running: true,
          cancellationRequested: false,
          lastMessage: startMessage,
          phase: prev.phase === 'IDLE' ? 'ID_DISCOVERY' : prev.phase,
        }));
        await fetchSyncStatus();
      } catch (error) {
        console.error('Nem sikerült elindítani a gyógyszer szinkront:', error.message || 'Unknown error');
        const message = limit !== null && limit !== undefined
          ? 'Nem sikerült elindítani a teszt szinkront.'
          : 'Nem sikerült elindítani a gyógyszer frissítést.';
        setManualSyncError(message);
      } finally {
        setIsStartingSync(false);
        setPendingStartType(null);
      }
    },
    [isStartingSync, isStoppingSync, syncStatus.running, syncStatus.cancellationRequested, fetchSyncStatus]
  );

  const handleManualSync = useCallback(() => {
    triggerSync({ force: false, limit: null, variant: 'standard' });
  }, [triggerSync]);

  const handleTestSync = useCallback(() => {
    triggerSync({ force: false, limit: TEST_SYNC_LIMIT, variant: 'limited' });
  }, [triggerSync]);

  const handleImageSync = useCallback(async () => {
    if (isImageSyncStarting || isStartingSync || isStoppingSync || syncStatus.running || syncStatus.cancellationRequested) {
      return;
    }

    setIsImageSyncStarting(true);
    setManualSyncError(null);
    try {
      await startImageSync();
      setSyncStatus((prev) => ({
        ...prev,
        running: true,
        cancellationRequested: false,
        lastMessage: 'Képkeresés indítása...',
        phase: 'ID_DISCOVERY',
      }));
      await fetchSyncStatus();
    } catch (error) {
      console.error('Nem sikerült elindítani a képkeresést:', error.message || 'Unknown error');
      setManualSyncError('Nem sikerült elindítani a hiányzó képek keresését.');
    } finally {
      setIsImageSyncStarting(false);
    }
  }, [isImageSyncStarting, isStartingSync, isStoppingSync, syncStatus.running, syncStatus.cancellationRequested, fetchSyncStatus]);

  const handleStopSync = useCallback(async () => {
    if (isStoppingSync || !syncStatus.running || syncStatus.cancellationRequested) {
      return;
    }

    setIsStoppingSync(true);
    setPendingStartType(null);
    setManualSyncError(null);
    try {
      await stopMedicationSync();
      setSyncStatus((prev) => ({
        ...prev,
        cancellationRequested: true,
        lastMessage: 'Leállítás kezdeményezve...',
      }));
      await fetchSyncStatus();
    } catch (error) {
      console.error('Nem sikerült leállítani a gyógyszer szinkront:', error.message || 'Unknown error');
      setManualSyncError('Nem sikerült leállítani a gyógyszer frissítést.');
    } finally {
      setIsStoppingSync(false);
    }
  }, [isStoppingSync, syncStatus.running, syncStatus.cancellationRequested, fetchSyncStatus]);




  // ...

  const quickActions = useMemo(
    () => [
      {
        label: 'Gyógyszer keresése',
        description: 'Találd meg gyorsan a szükséges gyógyszert',
        onPress: () => {
          haptics.light();
          router.push('/search');
        },
      },
      {
        label: 'Profilok kezelése',
        description: 'Kapcsolt felhasználók és emlékeztetők áttekintése',
        onPress: () => {
          haptics.light();
          router.push('/profile');
        },
      },
      {
        label: 'Gyógyszer felvétele',
        description: 'Adj hozzá új gyógyszert a profilokhoz',
        onPress: () => {
          haptics.light();
          router.push('/search?intent=add');
        },
      },
    ],
    [router]
  );

  const summaryCards = useMemo(() => {
    const adherence = dashboard.summary?.adherenceRate;
    const adherenceText =
      typeof adherence === 'number'
        ? `${Math.round(adherence * 100)}%`
        : adherence === null
          ? 'N/A'
          : adherence;

    return [
      {
        title: 'Aktív gyógyszerek',
        value: dashboard.summary?.totalMedications ?? '—',
      },
      {
        title: 'Mai emlékeztetők',
        value: dashboard.summary?.remindersToday ?? '—',
      },
      {
        title: 'Adherencia',
        value: adherenceText,
      },
      {
        title: 'Utolsó keresés',
        value: dashboard.summary?.lastSearch ?? '—',
      },
    ];
  }, [dashboard.summary]);

  const handleRefresh = useCallback(() => {
    if (!user) {
      return;
    }
    loadDashboard(true);
    fetchSyncStatus();
  }, [loadDashboard, user, fetchSyncStatus]);

  const formatCount = useCallback((value) => {
    if (value === null || value === undefined) {
      return '—';
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return '—';
    }
    try {
      return numeric.toLocaleString('hu-HU');
    } catch (error) {
      return String(numeric);
    }
  }, []);

  const syncProgressText = useMemo(() => {
    const denominator = syncStatus.totalKnown || syncStatus.discovered || Math.max(syncStatus.processed, syncStatus.succeeded, 0);
    const denomValue = denominator > 0 ? denominator : null;
    const numerator = syncStatus.processed ?? 0;
    return denomValue === null ? `${numerator} / —` : `${numerator} / ${denomValue}`;
  }, [syncStatus.processed, syncStatus.discovered, syncStatus.succeeded, syncStatus.totalKnown]);

  const syncSuccessText = useMemo(() => {
    const denominator = syncStatus.totalKnown || syncStatus.discovered || Math.max(syncStatus.succeeded, 0);
    const denomValue = denominator > 0 ? denominator : null;
    const numerator = syncStatus.succeeded ?? 0;
    return denomValue === null ? `${numerator} / —` : `${numerator} / ${denomValue}`;
  }, [syncStatus.succeeded, syncStatus.discovered, syncStatus.totalKnown]);

  const discoveryTargetText = useMemo(() => {
    const target = syncStatus.discoveryTarget;
    if (!target || target <= 0) {
      return '—';
    }
    return formatCount(target);
  }, [syncStatus.discoveryTarget, formatCount]);

  const discoveryNewText = useMemo(() => {
    const newFormatted = formatCount(syncStatus.discovered);
    return `${newFormatted} / ${discoveryTargetText}`;
  }, [syncStatus.discovered, discoveryTargetText, formatCount]);

  const discoveryScannedText = useMemo(() => formatCount(syncStatus.discoveryScanned), [syncStatus.discoveryScanned, formatCount]);

  const startDisabled = isStartingSync || isStoppingSync || syncStatus.running || syncStatus.cancellationRequested;
  const stopDisabled = !syncStatus.running || syncStatus.cancellationRequested || isStoppingSync;
  const stopInFlight = syncStatus.cancellationRequested || isStoppingSync;
  const isStandardStartPending = isStartingSync && pendingStartType === 'standard';
  const isTestStartPending = isStartingSync && pendingStartType === 'limited';

  const formatSeconds = useCallback((seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '—';
    }
    const total = Math.max(Math.round(seconds), 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} óra`);
    }
    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes} perc`);
    }
    parts.push(`${secs} mp`);
    return parts.join(' ');
  }, []);

  const estimatedTotalDurationText = useMemo(
    () => formatSeconds(syncStatus.estimatedTotalSeconds),
    [syncStatus.estimatedTotalSeconds, formatSeconds]
  );

  const estimatedRemainingDurationText = useMemo(
    () => formatSeconds(remainingSeconds),
    [remainingSeconds, formatSeconds]
  );

  const idleRemainingDurationText = useMemo(
    () => formatSeconds(syncStatus.estimatedRemainingSeconds),
    [syncStatus.estimatedRemainingSeconds, formatSeconds]
  );

  const averageSecondsText = useMemo(() => {
    const value = syncStatus.averageSecondsPerItem;
    if (!Number.isFinite(value) || value <= 0) {
      return '—';
    }
    return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  }, [syncStatus.averageSecondsPerItem]);

  const syncFinishedAtText = useMemo(() => {
    if (!syncStatus.finishedAt) {
      return null;
    }
    try {
      return new Date(syncStatus.finishedAt).toLocaleString('hu-HU');
    } catch (error) {
      return syncStatus.finishedAt;
    }
  }, [syncStatus.finishedAt]);

  if (!user) {
    return (
      <SafeAreaView style={styles.pageWrapper} edges={['top']}>
        <ScrollView
          style={styles.page}
          contentContainerStyle={styles.guestContent}
        >
          <View style={styles.authCard}>
            <Text style={styles.title}>Üdvözöllek a MediWeb-ben!</Text>
            <Text style={styles.subtitle}>
              Jelentkezz be vagy regisztrálj, hogy elérd a személyre szabott
              gyógyszerkövető felületet és a gyors akciókat.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.primaryButton, styles.fullWidthButton]}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.primaryButtonText}>Bejelentkezés</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.fullWidthButton]}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.secondaryButtonText}>Regisztráció</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pageWrapper} edges={['top']}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={[styles.pageContent, isMobile && { paddingHorizontal: 16 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={[styles.contentWrapper, isMobile && { paddingTop: 12 }]}>
          <View style={styles.heroCard}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Üdv, {user?.name || 'felhasználó'}!</Text>
              <Text style={styles.heroSubtitle}>
                Vezérlőpultod együtt mutatja a gyógyszerbevételeket, emlékeztetőket és keresési
                trendeket. Maradj naprakész egyetlen helyen.
              </Text>
            </View>
          </View>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {syncStatus.running && (
            <View style={styles.syncBanner}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={styles.syncSpinner}
              />
              <View style={styles.syncTextWrapper}>
                <Text style={styles.syncTitle}>Gyógyszer adatbázis frissítése folyamatban</Text>
                {isDiscoveryPhase ? (
                  <>
                    <Text style={styles.syncSubtitle}>{`Új azonosítók: ${discoveryNewText}`}</Text>
                    <Text style={styles.syncMeta}>{`Átnézett OGYEI találatok: ${discoveryScannedText}`}</Text>
                    <Text style={styles.syncMeta}>{`Cél: ${discoveryTargetText === '—' ? 'teljes adatbázis' : `${discoveryTargetText} új elem`} • Párhuzamos szálak: ${(syncStatus.parallelism || 1)}x`}</Text>
                    <Text style={styles.syncMeta}>{`Adatbázisban tárolt: ${formatCount(syncStatus.totalPersisted)} tétel`}</Text>
                    <Text style={styles.syncMeta}>{`Állapot: gyógyszer ID-k összegyűjtése folyamatban...`}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.syncSubtitle}>{`Előrehaladás: ${syncProgressText}`}</Text>
                    <Text style={styles.syncMeta}>{`Sikeres: ${syncSuccessText} • Kihagyott: ${syncStatus.skipped} • Sikertelen: ${syncStatus.failed}`}</Text>
                    <Text style={styles.syncMeta}>{`Teljes OGYEI állomány: ${syncStatus.totalKnown || '—'} tétel • Átlag: ${averageSecondsText}s/elem • Párhuzamos szálak: ${(syncStatus.parallelism || 1)}x`}</Text>
                    <Text style={styles.syncMeta}>{`Adatbázisban tárolt: ${formatCount(syncStatus.totalPersisted)} tétel`}</Text>
                    <Text style={styles.syncMeta}>{`Hátralévő idő: ${estimatedRemainingDurationText} • Várható teljes idő: ${estimatedTotalDurationText}`}</Text>
                  </>
                )}
              </View>
            </View>
          )}

          {__DEV__ && (
            <View style={styles.debugControls}>
              {manualSyncError ? (
                <Text style={styles.debugError}>{manualSyncError}</Text>
              ) : null}
              <Text style={styles.debugInfo}>{`Adatbázisban tárolt gyógyszerek: ${formatCount(syncStatus.totalPersisted)} tétel`}</Text>
              <Text style={styles.debugInfoSecondary}>{`Fázis: ${syncStatus.phase || '—'}`}</Text>
              <Text style={styles.debugInfoSecondary}>{`Új azonosítók: ${discoveryNewText}`}</Text>
              <Text style={styles.debugInfoSecondary}>{`Átnézett OGYEI találatok: ${discoveryScannedText}`}</Text>
              <Text style={styles.debugInfoSecondary}>{`Gyors teszt limit: ${TEST_SYNC_LIMIT} tétel`}</Text>
              {syncStatus.lastMessage ? (
                <Text style={styles.debugInfoSecondary}>{`Állapot: ${syncStatus.lastMessage}`}</Text>
              ) : null}
              {stopInFlight ? (
                <Text style={styles.debugInfoWarning}>Leállítás folyamatban, kérlek várj...</Text>
              ) : null}
              <View style={styles.debugButtonRow}>
                <TouchableOpacity
                  style={[
                    styles.debugButton,
                    styles.debugButtonStart,
                    startDisabled && styles.debugButtonDisabled,
                  ]}
                  onPress={handleManualSync}
                  disabled={startDisabled}
                >
                  {isStandardStartPending ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text style={styles.debugButtonText}>Debug: szinkron indítása</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.debugButton,
                    styles.debugButtonTest,
                    startDisabled && styles.debugButtonDisabled,
                  ]}
                  onPress={handleTestSync}
                  disabled={startDisabled}
                >
                  {isTestStartPending ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text style={styles.debugButtonText}>{`Debug: ${TEST_SYNC_LIMIT} elem teszt`}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.debugButton,
                    styles.debugButtonStart,
                    startDisabled && styles.debugButtonDisabled,
                    { backgroundColor: '#8E24AA' }
                  ]}
                  onPress={handleImageSync}
                  disabled={startDisabled}
                >
                  {isImageSyncStarting ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text style={styles.debugButtonText}>Debug: Képkeresés (Hiányzók)</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.debugButton,
                    styles.debugButtonStop,
                    stopDisabled && styles.debugButtonDisabled,
                  ]}
                  onPress={handleStopSync}
                  disabled={stopDisabled}
                >
                  {stopInFlight ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text style={styles.debugButtonText}>Debug: szinkron leállítása</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!syncStatus.running && syncStatus.finishedAt && (
            <View style={styles.syncBannerIdle}>
              <Text style={styles.syncIdleTitle}>Legutóbbi gyógyszer frissítés lezárva</Text>
              <Text style={styles.syncIdleSubtitle}>{`Összesen: ${syncSuccessText} • Kihagyott: ${syncStatus.skipped} • Hibás: ${syncStatus.failed}`}</Text>
              <Text style={styles.syncMetaSecondary}>{`Teljes OGYEI állomány: ${syncStatus.totalKnown || '—'} • Párhuzamos szálak: ${(syncStatus.parallelism || 1)}x • Becsült teljes idő: ${estimatedTotalDurationText}`}</Text>
              <Text style={styles.syncMetaSecondary}>{`Adatbázisban tárolt: ${formatCount(syncStatus.totalPersisted)}`}</Text>
              <Text style={styles.syncMetaSecondary}>{`Átlag: ${averageSecondsText}s/elem`}</Text>
              {syncStatus.estimatedRemainingSeconds > 0 ? (
                <Text style={styles.syncMetaSecondary}>{`Becsült hátralévő idő: ${idleRemainingDurationText}`}</Text>
              ) : null}
              {syncFinishedAtText ? (
                <Text style={styles.syncMetaSecondary}>{`Befejezve: ${syncFinishedAtText}`}</Text>
              ) : null}
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                {summaryCards.map((card) => (
                  <View key={card.title} style={[styles.summaryCard, isMobile && { minWidth: '44%', flexBasis: '44%' }]}>
                    <Text style={styles.cardLabel} numberOfLines={1}>{card.title}</Text>
                    <Text style={styles.cardValue} numberOfLines={1}>{card.value}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.gridRow, isMobile && { flexDirection: 'column' }]}>
                <View style={[styles.leftColumn, isMobile && { flex: 1, marginRight: 0, marginBottom: 16 }]}>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle} numberOfLines={1}>Népszerű gyógyszerek</Text>
                      <TouchableOpacity onPress={() => router.push('/search')}>
                        <Text style={styles.sectionAction}>Összes keresése</Text>
                      </TouchableOpacity>
                    </View>
                    {dashboard.popularMedications?.length ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {dashboard.popularMedications.map((medication) => (
                          <TouchableOpacity
                            key={medication.itemId || medication.id || medication.registrationNumber}
                            style={styles.popularCard}
                            onPress={() => {
                              const identifier = medication.itemId || medication.id;
                              if (identifier) {
                                router.push(`/medication/${identifier}`);
                              }
                            }}
                          >
                            <Text style={styles.popularCardTitle} numberOfLines={2}>{medication.name}</Text>
                            {medication.searchCount !== undefined && (
                              <Text style={styles.popularCardMeta}>
                                {medication.searchCount} keresés
                              </Text>
                            )}
                            {medication.shortDescription && (
                              <Text style={styles.popularCardDescription} numberOfLines={3}>
                                {medication.shortDescription}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text style={styles.emptyState}>
                        Még nem érkezett adat a népszerű gyógyszerekről.
                      </Text>
                    )}
                  </View>

                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle} numberOfLines={1}>Mai gyógyszerbevétel</Text>
                    </View>
                    {dashboard.todaysMedications?.length ? (
                      dashboard.todaysMedications.map((med) => (
                        <TouchableOpacity
                          key={med.profileMedicationId || med.medicationName}
                          style={styles.todayCard}
                          activeOpacity={0.7}
                          onPress={() => {
                            const query = med.profileId
                              ? `?profileId=${med.profileId}`
                              : med.profileName
                                ? `?profileName=${encodeURIComponent(med.profileName)}`
                                : '';
                            router.push(`/profile/intake${query}`);
                          }}
                        >
                          <View style={styles.todayCardHeader}>
                            <Text style={styles.todayCardTitle} numberOfLines={1}>{med.medicationName}</Text>
                            <Text style={styles.todayCardProfile}>{med.profileName}</Text>
                          </View>
                          <View style={styles.timeRow}>
                            {med.times?.map((time, idx) => {
                              const taken = med.takenFlags?.[idx];
                              return (
                                <View
                                  key={`${med.profileMedicationId || med.medicationName}-${time}-${idx}`}
                                  style={[
                                    styles.timeChip,
                                    taken ? styles.timeChipTaken : styles.timeChipPending,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.timeChipText,
                                      taken ? styles.timeChipTextTaken : null,
                                    ]}
                                  >
                                    {time} {taken ? '✓' : ''}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.emptyState}>
                        Ma nincs ütemezett gyógyszerbevétel vagy még nem adtál hozzá gyógyszert.
                      </Text>
                    )}
                  </View>
                </View>

                <View style={[styles.rightColumn, isMobile && { flex: 1 }]}>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle} numberOfLines={1}>Következő emlékeztető</Text>
                    </View>
                    {dashboard.upcomingReminder ? (
                      <View style={styles.reminderCard}>
                        <Text style={styles.reminderTitle} numberOfLines={2}>
                          {dashboard.upcomingReminder.medicationName}
                        </Text>
                        <Text style={styles.reminderInfo}>
                          {dashboard.upcomingReminder.time} – {dashboard.upcomingReminder.profileName}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.emptyState}>Nincs közelgő emlékeztető.</Text>
                    )}
                  </View>

                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle} numberOfLines={1}>Gyors műveletek</Text>
                    </View>
                    <View style={styles.quickActions}>
                      {quickActions.map((action) => (
                        <TouchableOpacity
                          key={action.label}
                          style={[styles.quickActionCard, isMobile && { flexBasis: '100%' }]}
                          onPress={action.onPress}
                        >
                          <Text style={styles.quickActionLabel}>{action.label}</Text>
                          <Text style={styles.quickActionDescription}>{action.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}