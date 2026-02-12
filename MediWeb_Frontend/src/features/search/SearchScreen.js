import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { createStyles } from "./SearchScreen.style";
import { useSearchService } from "./SearchService";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";
import { haptics } from "utils/haptics";
import FilterModal, { getActiveFilterCount, getActiveFilterLabels } from "./FilterModal";
import { useTheme } from "contexts/ThemeContext";

export default function SearchScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    searchQuery,
    setSearchQuery,
    filters,
    handleFilterChange,
    results,
    totalCount,
    handleSearch: serviceHandleSearch,
    loading,
    viewMode,
    setViewMode,
    hasMore,
    loadMore,
  } = useSearchService();

  const router = useRouter();
  const { isMobile } = useResponsiveLayout();
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const activeFilterCount = getActiveFilterCount(filters);
  const activeFilterLabels = getActiveFilterLabels(filters);

  const handleSearch = () => {
    haptics.medium();
    serviceHandleSearch();
  };

  const resetAllFilters = () => {
    const booleanFields = [
      "hasFinalSample", "hasDefectedForm", "fokozottFelugyelet",
      "lactoseFree", "glutenFree", "benzoateFree", "narcoticOnly",
    ];
    booleanFields.forEach((f) => handleFilterChange(f, false));
    handleFilterChange("atcCode", "");
    handleFilterChange("registrationNumber", "");
    handleFilterChange("authorisationDateFrom", "");
    handleFilterChange("authorisationDateTo", "");
    handleFilterChange("revokeDateFrom", "");
    handleFilterChange("revokeDateTo", "");
  };

  const removeFilter = (field, type) => {
    haptics.light();
    if (type === "boolean") {
      handleFilterChange(field, false);
    } else {
      handleFilterChange(field, "");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Gyógyszer kereső</Text>

        {/* Search bar + filter button row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <FontAwesome5 name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Keress gyógyszer nevére..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome5 name="times-circle" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter button */}
          <TouchableOpacity
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            onPress={() => {
              haptics.light();
              setFilterModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name="sliders-h"
              size={18}
              color={activeFilterCount > 0 ? theme.colors.white : theme.colors.textSecondary}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active filter chips */}
        {activeFilterLabels.length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContent}>
              {activeFilterLabels.map(({ field, label, type }) => (
                <TouchableOpacity
                  key={field}
                  style={styles.activeChip}
                  onPress={() => removeFilter(field, type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activeChipText} numberOfLines={1}>{label}</Text>
                  <FontAwesome5 name="times" size={10} color={theme.colors.primary} style={styles.activeChipClose} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.clearAllChip}
                onPress={() => {
                  haptics.light();
                  resetAllFilters();
                }}
              >
                <Text style={styles.clearAllChipText}>Összes törlése</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Results */}
        {loading && results.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonCard}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
              </View>
            ))}
          </View>
        ) : results.length === 0 && !loading ? (
          <View style={styles.emptyStateContainer}>
            <FontAwesome5 name="search" size={64} color={theme.colors.border} />
            <Text style={styles.emptyStateTitle}>Nincs találat</Text>
            <Text style={styles.emptyStateSubtitle}>
              Próbálj más keresési kifejezést használni vagy módosítsd a szűrőket
            </Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  setSearchQuery("");
                  resetAllFilters();
                }}
              >
                <FontAwesome5 name="redo" size={16} color={theme.colors.primary} />
                <Text style={styles.clearAllButtonText}>Szűrők törlése</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Results count + view switcher */}
            <View style={styles.topBar}>
              <Text style={styles.resultCount}>
                {loading ? "Keresés..." : `${results.length} találat`}
              </Text>
              {!isMobile && (
                <View style={styles.viewSwitcher}>
                  <TouchableOpacity
                    style={[styles.viewSwitcherButton, viewMode === "grid" && styles.viewSwitcherButtonActive]}
                    onPress={() => setViewMode("grid")}
                  >
                    <MaterialIcons name="grid-view" size={24} color={viewMode === "grid" ? theme.colors.primary : theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.viewSwitcherButton, viewMode === "list" && styles.viewSwitcherButtonActive]}
                    onPress={() => setViewMode("list")}
                  >
                    <MaterialIcons name="view-list" size={24} color={viewMode === "list" ? theme.colors.primary : theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={viewMode === "grid" ? styles.grid : null}>
              {results.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  style={viewMode === "grid"
                    ? [styles.gridItem, isMobile && { width: "100%" }]
                    : styles.listItem
                  }
                  onPress={() => {
                    haptics.light();
                    router.push(`/medication/${med.id}`);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.substance}>{med.substance}</Text>
                  <Text style={styles.company}>{med.company}</Text>
                  <Text style={[styles.status, med.active === false && styles.inactiveStatus]}>
                    {med.status || "Nincs státusz"}
                    {med.active === false ? " • Inaktív adat" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
              {hasMore && (
                <TouchableOpacity
                  onPress={loadMore}
                  disabled={loading}
                  style={styles.loadMoreButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>További találatok betöltése</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetAllFilters}
      />
    </ScrollView>
  );
}