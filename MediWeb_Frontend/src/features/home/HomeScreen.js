import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { styles } from './HomeScreen.style';
import { theme } from 'styles/theme';
import { getHomeDashboard, getPopularMedications } from './home.api';
import { getMedicationSyncStatus } from 'features/medication/medication.api';

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
  processed: 0,
  succeeded: 0,
  failed: 0,
  skipped: 0,
  totalKnown: 0,
  averageSecondsPerItem: 10,
  parallelism: 1,
  estimatedTotalSeconds: 0,
  estimatedRemainingSeconds: 0,
  phase: 'IDLE',
  discoveryCompleted: true,
  lastMessage: null,
};

export default function HomeScreen() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(() => createDefaultDashboard());
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [syncStatus, setSyncStatus] = useState(DEFAULT_SYNC_STATUS);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const status = await getMedicationSyncStatus();
      if (status && typeof status === 'object') {
        setSyncStatus({
          ...DEFAULT_SYNC_STATUS,
          ...status,
        });
        return status;
      }
    } catch (statusError) {
      console.error('Gyógyszer adatbázis szinkron státusz lekérdezési hiba:', statusError);
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
            console.warn('Popular medications endpoint is not available yet.', popularError);
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
        console.error('Dashboard betöltési hiba:', dashboardError);
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
    if (!syncStatus.running) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchSyncStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, [syncStatus.running, fetchSyncStatus]);

  useEffect(() => {
    if (!syncStatus.running || !syncStatus.discoveryCompleted) {
      setRemainingSeconds(0);
      return;
    }

    const estimated = Number.isFinite(syncStatus.estimatedRemainingSeconds)
      ? Math.max(Math.round(syncStatus.estimatedRemainingSeconds), 0)
      : 0;
    setRemainingSeconds(estimated);
  }, [syncStatus.running, syncStatus.estimatedRemainingSeconds]);

  useEffect(() => {
    if (!syncStatus.running || !syncStatus.discoveryCompleted) {
      return undefined;
    }

    const ticker = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(ticker);
  }, [syncStatus.running, syncStatus.discoveryCompleted]);

  const isDiscoveryPhase = syncStatus.running && syncStatus.phase === 'ID_DISCOVERY';

  const quickActions = useMemo(
    () => [
      {
        label: 'Gyógyszer keresése',
        description: 'Találd meg gyorsan a szükséges gyógyszert',
        onPress: () => navigate('/search'),
      },
      {
        label: 'Profilok kezelése',
        description: 'Kapcsolt felhasználók és emlékeztetők áttekintése',
        onPress: () => navigate('/user'),
      },
      {
        label: 'Gyógyszer felvétele',
        description: 'Adj hozzá új gyógyszert a profilokhoz',
        onPress: () => navigate('/search?intent=add'),
      },
    ],
    [navigate]
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
      <View style={styles.pageWrapper}>
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
                onPress={() => navigate('/login')}
              >
                <Text style={styles.primaryButtonText}>Bejelentkezés</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.fullWidthButton]}
                onPress={() => navigate('/register')}
              >
                <Text style={styles.secondaryButtonText}>Regisztráció</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.pageWrapper}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.contentWrapper}>
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
                    <Text style={styles.syncSubtitle}>{`Azonosítók kigyűjtése: ${syncStatus.discovered}`}</Text>
                    <Text style={styles.syncMeta}>{`Aktuális becslés: ${syncStatus.totalKnown || syncStatus.discovered || '—'} tétel • Párhuzamos szálak: ${(syncStatus.parallelism || 1)}x`}</Text>
                    <Text style={styles.syncMeta}>{`Állapot: gyógyszer ID-k összegyűjtése folyamatban…`}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.syncSubtitle}>{`Előrehaladás: ${syncProgressText}`}</Text>
                    <Text style={styles.syncMeta}>{`Sikeres: ${syncSuccessText} • Kihagyott: ${syncStatus.skipped} • Sikertelen: ${syncStatus.failed}`}</Text>
                    <Text style={styles.syncMeta}>{`Teljes OGYEI állomány: ${syncStatus.totalKnown || '—'} tétel • Átlag: ${averageSecondsText}s/elem • Párhuzamos szálak: ${(syncStatus.parallelism || 1)}x`}</Text>
                    <Text style={styles.syncMeta}>{`Hátralévő idő: ${estimatedRemainingDurationText} • Várható teljes idő: ${estimatedTotalDurationText}`}</Text>
                  </>
                )}
              </View>
            </View>
          )}

          {!syncStatus.running && syncStatus.finishedAt && (
            <View style={styles.syncBannerIdle}>
              <Text style={styles.syncIdleTitle}>Legutóbbi gyógyszer frissítés lezárva</Text>
              <Text style={styles.syncIdleSubtitle}>{`Összesen: ${syncSuccessText} • Kihagyott: ${syncStatus.skipped} • Hibás: ${syncStatus.failed}`}</Text>
              <Text style={styles.syncMetaSecondary}>{`Teljes OGYEI állomány: ${syncStatus.totalKnown || '—'} • Párhuzamos szálak: ${(syncStatus.parallelism || 1)}x • Becsült teljes idő: ${estimatedTotalDurationText}`}</Text>
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
                  <View key={card.title} style={styles.summaryCard}>
                    <Text style={styles.cardLabel}>{card.title}</Text>
                    <Text style={styles.cardValue}>{card.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.gridRow}>
                <View style={styles.leftColumn}>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Népszerű gyógyszerek</Text>
                      <TouchableOpacity onPress={() => navigate('/search')}>
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
                                navigate(`/medication/${identifier}`);
                              }
                            }}
                          >
                            <Text style={styles.popularCardTitle}>{medication.name}</Text>
                            {medication.searchCount !== undefined && (
                              <Text style={styles.popularCardMeta}>
                                {medication.searchCount} keresés
                              </Text>
                            )}
                            {medication.shortDescription && (
                              <Text style={styles.popularCardDescription}>
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
                      <Text style={styles.sectionTitle}>Mai gyógyszerbevétel</Text>
                    </View>
                    {dashboard.todaysMedications?.length ? (
                      dashboard.todaysMedications.map((med) => (
                        <View
                          key={med.profileMedicationId || med.medicationName}
                          style={styles.todayCard}
                        >
                          <View style={styles.todayCardHeader}>
                            <Text style={styles.todayCardTitle}>{med.medicationName}</Text>
                            <Text style={styles.todayCardProfile}>{med.profileName}</Text>
                          </View>
                          <View style={styles.timeRow}>
                            {med.times?.map((time, idx) => {
                              const taken = med.takenFlags?.[idx];
                              return (
                                <View
                                  key={`${med.profileMedicationId || med.medicationName}-${time}`}
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
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyState}>
                        Ma nincs ütemezett gyógyszerbevétel vagy még nem adtál hozzá gyógyszert.
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.rightColumn}>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Következő emlékeztető</Text>
                    </View>
                    {dashboard.upcomingReminder ? (
                      <View style={styles.reminderCard}>
                        <Text style={styles.reminderTitle}>
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
                      <Text style={styles.sectionTitle}>Gyors műveletek</Text>
                    </View>
                    <View style={styles.quickActions}>
                      {quickActions.map((action) => (
                        <TouchableOpacity
                          key={action.label}
                          style={styles.quickActionCard}
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
    </View>
  );
}