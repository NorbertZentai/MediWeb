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
import { Ionicons } from '@expo/vector-icons';
import { getHomeDashboard, getPopularMedications } from './home.api';
import { haptics } from 'utils/haptics';

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

import { useResponsiveLayout } from 'hooks/useResponsiveLayout';

export default function HomeScreen() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const { isMobile } = useResponsiveLayout();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isMobile, isDark), [theme, isMobile, isDark]);

  const [dashboard, setDashboard] = useState(() => createDefaultDashboard());
  // ... existing state ...
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [guestPopular, setGuestPopular] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);
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
    [user]
  );

  useEffect(() => {
    if (!loading) {
      loadDashboard(false);
    }
  }, [loading, loadDashboard]);

  // Load popular medications for guest users (public endpoint)
  useEffect(() => {
    if (!user && !loading) {
      setGuestLoading(true);
      getPopularMedications()
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.medications || data?.data || [];
          setGuestPopular(list);
        })
        .catch(() => {})
        .finally(() => setGuestLoading(false));
    }
  }, [user, loading]);

// ...

  const quickActions = useMemo(
    () => [
      {
        label: 'Gyógyszer keresése',
        description: 'Találd meg gyorsan a szükséges gyógyszert',
        icon: 'search',
        color: '#3B82F6',
        onPress: () => {
          haptics.light();
          router.push('/search');
        },
      },
      {
        label: 'Profilok kezelése',
        description: 'Kapcsolt felhasználók és emlékeztetők áttekintése',
        icon: 'people',
        color: '#10B981',
        onPress: () => {
          haptics.light();
          router.push('/profile');
        },
      },
      {
        label: 'Gyógyszer felvétele',
        description: 'Adj hozzá új gyógyszert a profilokhoz',
        icon: 'add-circle',
        color: '#F59E0B',
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
        icon: 'medical',
      },
      {
        title: 'Mai emlékeztetők',
        value: dashboard.summary?.remindersToday ?? '—',
        icon: 'notifications',
      },
      {
        title: 'Adherencia',
        value: adherenceText,
        icon: 'checkmark-circle',
      },
      {
        title: 'Utolsó keresés',
        value: dashboard.summary?.lastSearch ?? '—',
        icon: 'time',
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
      <SafeAreaView style={styles.pageWrapper} edges={['top']}>
        <ScrollView
          style={styles.page}
          contentContainerStyle={styles.pageContent}
        >
          <View style={styles.contentWrapper}>
            {/* Hero section */}
            <View style={styles.heroCard}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Üdvözöllek a MediWeb-ben!</Text>
                <Text style={styles.heroSubtitle}>
                  Keresd meg gyógyszereidet, olvasd el a részletes adatlapokat, és
                  regisztrálj a személyre szabott emlékeztetőkért.
                </Text>
                <TouchableOpacity
                  style={styles.heroButton}
                  onPress={() => router.push('/search')}
                >
                  <Text style={styles.heroButtonText}>Gyógyszer keresése</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Popular medications */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Népszerű gyógyszerek</Text>
                <TouchableOpacity onPress={() => router.push('/search')}>
                  <Text style={styles.sectionAction}>Összes keresése</Text>
                </TouchableOpacity>
              </View>
              {guestLoading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : guestPopular.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 16 }}
                >
                  {guestPopular.map((medication) => (
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

            {/* Auth CTA */}
            <View style={styles.authCard}>
              <Text style={styles.title}>Személyre szabott funkciók</Text>
              <Text style={styles.subtitle}>
                Jelentkezz be vagy regisztrálj a kedvencek, emlékeztetők és
                személyes gyógyszerprofil eléréséhez.
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
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pageWrapper} edges={['top']}>
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
                trendeket. Maradj naprakész.
              </Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => router.push('/search')}
              >
                <Text style={styles.heroButtonText}>Gyógyszer keresése</Text>
              </TouchableOpacity>
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
                    <View style={styles.summaryIconWrapper}>
                      <Ionicons name={card.icon} size={22} color={theme.colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.cardLabel} numberOfLines={1}>{card.title}</Text>
                      <Text style={styles.cardValue} numberOfLines={1}>{card.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.gridRow}>
                <View style={styles.leftColumn}>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Népszerű gyógyszerek</Text>
                      <TouchableOpacity onPress={() => router.push('/search')}>
                        <Text style={styles.sectionAction}>Összes keresése</Text>
                      </TouchableOpacity>
                    </View>
                    {dashboard.popularMedications?.length ? (
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={true}
                        contentContainerStyle={{ paddingBottom: 16 }}
                      >
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

                <View style={styles.rightColumn}>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Következő emlékeztető</Text>
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
                          style={styles.quickActionCard}
                          onPress={action.onPress}
                        >
                          <View style={[styles.quickActionIconWrapper, { backgroundColor: `${action.color}15` }]}>
                            <Ionicons name={action.icon} size={24} color={action.color} />
                          </View>
                          <View style={styles.quickActionContent}>
                            <Text style={styles.quickActionLabel}>{action.label}</Text>
                            <Text style={styles.quickActionDescription}>{action.description}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
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