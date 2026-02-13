import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { LineChart, PieChart, BarChart, ProgressChart } from "react-native-chart-kit";
import { toast } from 'utils/toast';
import {
  getCategoryStatistics,
  getComplianceStatistics,
  getMissedDoseStatistics,
  getPeakIntakeTimes,
  getTrendStatistics,
} from "features/profile/profile.api";
import { createStyles } from "./StatisticsTab.style";
import { useTheme } from "contexts/ThemeContext";

const periodOptions = [
  { key: "weekly", label: "Heti" },
  { key: "monthly", label: "Havi" },
  { key: "quarterly", label: "Negyedéves" },
];

const fallbackStatistics = {
  complianceRate: null,
  complianceHistory: [],
  categoryBreakdown: [],
  missedDoses: [],
  peakTimes: [],
  totals: {
    takenDoses: 0,
    totalDoses: 0,
  },
  timeframe: "monthly",
  lastUpdated: null,
};

const palette = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6", "#14B8A6", "#EC4899"];

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
};

const normalizeHistory = (payload) => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload
      .map((point) => ({
        label: point.label ?? point.period ?? "",
        value: Number(point.value ?? point.rate ?? point.compliance ?? 0),
      }))
      .filter((point) => point.label);
  }

  if (Array.isArray(payload?.history)) {
    return payload.history
      .map((point) => ({
        label: point.label ?? point.period ?? "",
        value: Number(point.value ?? point.rate ?? 0),
      }))
      .filter((point) => point.label);
  }

  if (Array.isArray(payload?.labels) && Array.isArray(payload?.data)) {
    return payload.labels.map((label, index) => ({
      label,
      value: Number(payload.data[index] ?? 0),
    }));
  }

  return null;
};

const normalizeCategories = (payload) => {
  const source = Array.isArray(payload?.categories) ? payload.categories : payload;
  if (!Array.isArray(source)) {
    return null;
  }

  return source
    .map((item, index) => ({
      label: item.label ?? item.name ?? item.category ?? `Kategória ${index + 1}`,
      value: Number(item.value ?? item.count ?? item.total ?? 0),
    }))
    .filter((item) => item.value > 0);
};

const normalizeSeries = (payload) => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload?.labels) && Array.isArray(payload?.data)) {
    return payload.labels.map((label, index) => ({
      label,
      value: Number(payload.data[index] ?? 0),
    }));
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => ({
        label: item.label ?? item.period ?? item.time ?? "",
        value: Number(item.value ?? item.count ?? 0),
      }))
      .filter((item) => item.label);
  }

  return null;
};

export default function StatisticsTab() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [statistics, setStatistics] = useState(fallbackStatistics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(true);

  const chartConfig = useMemo(() => ({
    backgroundColor: theme.colors.backgroundCard,
    backgroundGradientFrom: theme.colors.backgroundCard,
    backgroundGradientTo: theme.colors.backgroundCard,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.textSecondary, // Use theme text color
    propsForBackgroundLines: {
      stroke: theme.colors.border, // Use theme border color
    },
    propsForLabels: {
      fontSize: 12,
    },
  }), [theme]);

  const chartWidth = useMemo(() => {
    if (!width) {
      return 320;
    }
    return Math.max(280, Math.min(width - 40, 720));
  }, [width]);

  const hasAnyData = useMemo(() => {
    if (!statistics) {
      return false;
    }

    const totals = statistics.totals ?? {};
    return (
      statistics.complianceRate !== null ||
      (statistics.complianceHistory ?? []).length > 0 ||
      (statistics.categoryBreakdown ?? []).length > 0 ||
      (statistics.missedDoses ?? []).length > 0 ||
      (statistics.peakTimes ?? []).length > 0 ||
      (totals.takenDoses ?? 0) > 0 ||
      (totals.totalDoses ?? 0) > 0
    );
  }, [statistics]);

  const subtitleLabel = useMemo(() => {
    if (!hasAnyData) {
      return "Nincs statisztika";
    }

    if (usingFallback) {
      return "Részleges adatok";
    }

    return "Valós idejű adatok";
  }, [hasAnyData, usingFallback]);

  const loadStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const requests = await Promise.allSettled([
      getComplianceStatistics({ period: selectedPeriod }),
      getTrendStatistics({ period: selectedPeriod }),
      getCategoryStatistics({ period: selectedPeriod }),
      getMissedDoseStatistics({ period: selectedPeriod }),
      getPeakIntakeTimes({ period: selectedPeriod }),
    ]);

    const [complianceRes, trendRes, categoryRes, missedRes, peakRes] = requests;

    const nextStats = {
      ...fallbackStatistics,
      timeframe: selectedPeriod,
      lastUpdated: new Date().toISOString(),
    };

    const fulfilled = requests.filter((result) => result.status === "fulfilled");
    const rejected = requests.length - fulfilled.length;

    if (complianceRes.status === "fulfilled" && complianceRes.value) {
      const payload = complianceRes.value;
      const resolvedRate = payload.rate ?? payload.complianceRate ?? payload.value ?? payload.percentage;
      if (resolvedRate !== undefined && resolvedRate !== null) {
        nextStats.complianceRate = Number(resolvedRate);
      }

      const taken = payload.takenDoses ?? payload.taken;
      const total = payload.totalDoses ?? payload.total;
      nextStats.totals = {
        takenDoses: taken !== undefined && taken !== null ? Number(taken) : nextStats.totals.takenDoses,
        totalDoses: total !== undefined && total !== null ? Number(total) : nextStats.totals.totalDoses,
      };
    }

    const history = trendRes.status === "fulfilled" ? normalizeHistory(trendRes.value) : null;
    if (history?.length) {
      nextStats.complianceHistory = history;
    }

    const categories = categoryRes.status === "fulfilled" ? normalizeCategories(categoryRes.value) : null;
    if (categories?.length) {
      nextStats.categoryBreakdown = categories;
    }

    const missed = missedRes.status === "fulfilled" ? normalizeSeries(missedRes.value) : null;
    if (missed?.length) {
      nextStats.missedDoses = missed;
    }

    const peaks = peakRes.status === "fulfilled" ? normalizeSeries(peakRes.value) : null;
    if (peaks?.length) {
      nextStats.peakTimes = peaks;
    }

    if (fulfilled.length === 0) {
      setStatistics(fallbackStatistics);
      setUsingFallback(true);
      setError("Nem sikerült lekérni a statisztikákat, később próbáld újra.");
      toast.error("Nem sikerült betölteni a statisztikákat, jelenleg nem elérhetők.");
    } else {
      setStatistics(nextStats);
      setUsingFallback(rejected > 0);
      if (rejected > 0) {
        setError("Néhány statisztika jelenleg nem érhető el, részleges adatok láthatók.");
        toast.warn("Néhány statisztika jelenleg nem érhető el, részleges adatok láthatók.");
      } else {
        setError(null);
      }
    }

    setLoading(false);
  }, [selectedPeriod]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const categoryChartData = useMemo(
    () =>
      statistics.categoryBreakdown.map((item, index) => ({
        name: item.label,
        population: item.value,
        color: palette[index % palette.length],
        legendFontColor: theme.colors.textSecondary,
        legendFontSize: 13,
      })),
    [statistics.categoryBreakdown, theme.colors.textSecondary]
  );

  const complianceLineData = useMemo(
    () => ({
      labels: statistics.complianceHistory.map((point) => point.label),
      datasets: [
        {
          data: statistics.complianceHistory.map((point) => Math.round(point.value * 100)),
          color: () => "rgba(16, 185, 129, 1)",
          strokeWidth: 3,
        },
      ],
    }),
    [statistics.complianceHistory]
  );

  const missedBarData = useMemo(
    () => ({
      labels: statistics.missedDoses.map((item) => item.label),
      datasets: [
        {
          data: statistics.missedDoses.map((item) => item.value),
        },
      ],
    }),
    [statistics.missedDoses]
  );

  const peakBarData = useMemo(
    () => ({
      labels: statistics.peakTimes.map((item) => item.label),
      datasets: [
        {
          data: statistics.peakTimes.map((item) => item.value),
          color: () => "rgba(59, 130, 246, 1)",
        },
      ],
    }),
    [statistics.peakTimes]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Statisztikák</Text>
            <Text style={styles.subtitle}>{subtitleLabel}</Text>
          </View>

          {/* Modern Period Tabs */}
          <View style={styles.periodTabsContainer}>
            {periodOptions.map((option) => {
              const isActive = option.key === selectedPeriod;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.periodTab, isActive && styles.periodTabActive]}
                  onPress={() => setSelectedPeriod(option.key)}
                  disabled={option.key === selectedPeriod}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.periodTabLabel, isActive && styles.periodTabLabelActive]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.secondary} />
            <Text style={styles.helperText}>Statisztikák betöltése...</Text>
          </View>
        ) : (
          <>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Compliance ráta</Text>
                <Text style={styles.cardSubtitle}>Összesített teljesítés a kiválasztott időszakban</Text>
              </View>
              <Text style={styles.complianceValue}>{formatPercentage(statistics.complianceRate)}</Text>
              {statistics.totals.totalDoses > 0 ? (
                <Text style={styles.complianceMeta}>
                  {statistics.totals.takenDoses ?? 0} / {statistics.totals.totalDoses ?? 0} adag bevéve
                </Text>
              ) : (
                <Text style={styles.helperText}>Még nem rögzítettél bevett adagokat ebben az időszakban.</Text>
              )}
              {statistics.complianceRate !== null ? (
                <View style={styles.chartWrapper}>
                  <ProgressChart
                    data={{ labels: [""], data: [statistics.complianceRate] }}
                    width={chartWidth}
                    height={220}
                    strokeWidth={12}
                    radius={90}
                    chartConfig={{
                      ...chartConfig,
                      decimalPlaces: 2,
                    }}
                    hideLegend
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Ehhez a statisztikához még nem áll rendelkezésre adat.</Text>
                </View>
              )}
              <Text style={styles.helperText}>A compliance ráta a bevett adagok arányát mutatja.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Időbeli trendek</Text>
                <Text style={styles.cardSubtitle}>Szedési pontosság alakulása időben</Text>
              </View>
              {statistics.complianceHistory.length ? (
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={complianceLineData}
                    width={chartWidth}
                    height={240}
                    chartConfig={{
                      ...chartConfig,
                      decimalPlaces: 1,
                    }}
                    bezier
                    style={{ borderRadius: 16 }}
                    yAxisSuffix="%"
                    fromZero
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Ehhez a nézethez még nem áll rendelkezésre adat.</Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Gyógyszer kategóriák</Text>
                <Text style={styles.cardSubtitle}>Megoszlás kategóriánként</Text>
              </View>
              {categoryChartData.length ? (
                <>
                  <View style={styles.chartWrapper}>
                    <PieChart
                      data={categoryChartData}
                      width={Math.max(240, chartWidth - 60)}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="0"
                      center={[Math.max(240, chartWidth - 60) / 4, 0]}
                      absolute
                      hasLegend={false}
                    />
                  </View>
                  <View style={styles.legendList}>
                    {categoryChartData.map((item) => (
                      <View key={item.name} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendLabel}>
                          {item.name}: {item.population}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Nincs elérhető kategória adat.</Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Kihagyott adagok</Text>
                <Text style={styles.cardSubtitle}>Hányszor maradt el az adag</Text>
              </View>
              {statistics.missedDoses.length ? (
                <View style={styles.chartWrapper}>
                  <BarChart
                    data={missedBarData}
                    width={chartWidth}
                    height={260}
                    chartConfig={chartConfig}
                    fromZero
                    showBarTops
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Még nem történt kihagyott adag a megadott időszakban.</Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Leggyakoribb szedési idők</Text>
                <Text style={styles.cardSubtitle}>Mikor veszik be leginkább a gyógyszereket</Text>
              </View>
              {statistics.peakTimes.length ? (
                <View style={styles.chartWrapper}>
                  <BarChart
                    data={peakBarData}
                    width={chartWidth}
                    height={260}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    }}
                    fromZero
                    showValuesOnTopOfBars
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Nincs elég adat a leggyakoribb időpontokhoz.</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View >
  );
}
