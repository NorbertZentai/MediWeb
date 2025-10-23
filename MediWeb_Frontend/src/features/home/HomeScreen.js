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

const createDefaultDashboard = () => ({
  summary: { ...DEFAULT_DASHBOARD_TEMPLATE.summary },
  upcomingReminder: null,
  popularMedications: [],
  todaysMedications: [],
});

export default function HomeScreen() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(() => createDefaultDashboard());
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadDashboard = useCallback(
    async (isManualRefresh = false) => {
      if (!user) {
        setDashboard(createDefaultDashboard());
        setErrorMessage(null);
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
    [user]
  );

  useEffect(() => {
    if (!loading) {
      loadDashboard(false);
    }
  }, [loading, loadDashboard]);

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
  }, [loadDashboard, user]);

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
                            onPress={() =>
                              medication.itemId || medication.id
                                ? navigate(`/medication/${medication.itemId || medication.id}`)
                                : undefined
                            }
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