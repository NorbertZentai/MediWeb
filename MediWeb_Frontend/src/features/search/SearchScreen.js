import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { styles } from "./SearchScreen.style";
import { useSearchService } from "./SearchService";
import { useResponsiveLayout } from "hooks/useResponsiveLayout";
import { haptics } from "utils/haptics";

const booleanFilters = [
  { field: "hasFinalSample", label: "Van véglegminta engedélye" },
  { field: "hasDefectedForm", label: "Van alaki hiba engedélye" },
  { field: "fokozottFelugyelet", label: "Fokozott felügyelet alatt áll" },
];

export default function SearchScreen() {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    handleFilterChange,
    results,
    totalCount,
    handleSearch: serviceHandleSearch,
    loading,
    filtersExpanded,
    setFiltersExpanded,
    viewMode,
    setViewMode,
    hasMore,
    loadMore,
  } = useSearchService();

  const router = useRouter();
  const params = useLocalSearchParams();
  const { isMobile } = useResponsiveLayout();

  const handleSearch = () => {
    haptics.medium();
    serviceHandleSearch();
  };

  const toggleFilters = () => {
    haptics.light();
    setFiltersExpanded(!filtersExpanded);
  };

  const handleViewModeChange = (mode) => {
    haptics.light();
    setViewMode(mode);
  };



  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#E8F5E9" }} contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Gyógyszer kereső</Text>

        {/* Modern Search Bar */}
        <View style={styles.searchBarContainer}>
          <FontAwesome5 name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Keress gyógyszer nevére..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5 name="times-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filters - Modern Chips */}
        <View style={styles.quickFiltersContainer}>
          <View style={styles.quickFiltersHeader}>
            <Text style={styles.quickFiltersTitle}>Gyors szűrők</Text>
            {(filters.hasFinalSample || filters.hasDefectedForm || filters.fokozottFelugyelet) && (
              <TouchableOpacity
                onPress={() => {
                  handleFilterChange('hasFinalSample', false);
                  handleFilterChange('hasDefectedForm', false);
                  handleFilterChange('fokozottFelugyelet', false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.clearFiltersText}>Törlés</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.chipRow}>
            {booleanFilters.map(({ field, label }) => (
              <TouchableOpacity
                key={field}
                onPress={() => {
                  haptics.light();
                  handleFilterChange(field, !filters[field]);
                }}
                style={[
                  styles.filterChip,
                  filters[field] && styles.filterChipActive
                ]}
                activeOpacity={0.7}
              >
                {filters[field] && (
                  <FontAwesome5 name="check" size={14} color="#FFFFFF" style={styles.chipIcon} />
                )}
                <Text style={[
                  styles.filterChipText,
                  filters[field] && styles.filterChipTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Részletes szűrés */}
        <TouchableOpacity onPress={toggleFilters}>
          <Text style={styles.expandFilters}>{filtersExpanded ? "- Szűrők elrejtése" : "+ Részletes szűrők"}</Text>
        </TouchableOpacity>

        {filtersExpanded && (
          <View style={styles.filtersContainer}>
            {/* Szöveges mezők */}
            <View style={styles.filterGrid}>
              <TextInput
                style={[styles.filterInput, isMobile && { width: '100%' }]} // Added isMobile style
                placeholder="ATC kód"
                value={filters.atcCode}
                onChangeText={(text) => handleFilterChange("atcCode", text)}
              />
              <TextInput
                style={[styles.filterInput, isMobile && { width: '100%' }]} // Added isMobile style
                placeholder="Nyilvántartási szám"
                value={filters.registrationNumber}
                onChangeText={(text) => handleFilterChange("registrationNumber", text)}
              />
            </View>

            {/* Dátum mezők */}
            <Text style={styles.filterSectionTitle}>Engedélyezés dátuma</Text>
            <View style={styles.filterGrid}>
              <TextInput
                style={[styles.dateInput, isMobile && { width: '100%' }]} // Added isMobile style
                placeholder="Dátum -tól (YYYY-MM-DD)"
                value={filters.authorisationDateFrom}
                onChangeText={(text) => handleFilterChange("authorisationDateFrom", text)}
              />
              <TextInput
                style={[styles.dateInput, isMobile && { width: '100%' }]} // Added isMobile style
                placeholder="Dátum -ig (YYYY-MM-DD)"
                value={filters.authorisationDateTo}
                onChangeText={(text) => handleFilterChange("authorisationDateTo", text)}
              />
            </View>

            <Text style={styles.filterSectionTitle}>Törlés dátuma</Text>
            <View style={styles.filterGrid}>
              <TextInput
                style={[styles.dateInput, isMobile && { width: '100%' }]} // Added isMobile style
                placeholder="Dátum -tól (YYYY-MM-DD)"
                value={filters.revokeDateFrom}
                onChangeText={(text) => handleFilterChange("revokeDateFrom", text)}
              />
              <TextInput
                style={[styles.dateInput, isMobile && { width: '100%' }]} // Added isMobile style
                placeholder="Dátum -ig (YYYY-MM-DD)"
                value={filters.revokeDateTo}
                onChangeText={(text) => handleFilterChange("revokeDateTo", text)}
              />
            </View>

            {/* További checkbox szűrők */}
            <Text style={styles.filterSectionTitle}>További szűrők</Text>
            <View style={styles.checkboxRow}>
              {booleanFilters.map(({ field, label }) => (
                <TouchableOpacity key={field} onPress={() => handleFilterChange(field, !filters[field])}>
                  <Text style={[styles.checkbox, filters[field] && styles.checkboxActive]}>
                    {filters[field] ? "☑" : "☐"} {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Találatok */}
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
            <FontAwesome5 name="search" size={64} color="#E2E8F0" />
            <Text style={styles.emptyStateTitle}>Nincs találat</Text>
            <Text style={styles.emptyStateSubtitle}>
              Próbálj más keresési kifejezést használni vagy módosítsd a szűrőket
            </Text>
            {(filters.hasFinalSample || filters.hasDefectedForm || filters.fokozottFelugyelet ||
              filters.atcCode || filters.registrationNumber) && (
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={() => {
                    setSearchQuery('');
                    Object.keys(filters).forEach(key => handleFilterChange(key, false));
                  }}
                >
                  <FontAwesome5 name="redo" size={16} color="#2E7D32" />
                  <Text style={styles.clearAllButtonText}>Szűrők törlése</Text>
                </TouchableOpacity>
              )}
          </View>
        ) : (
          <>
            {/* Nézetváltó és Találatok száma - csak ha van találat vagy keresés történt */}
            <View style={styles.topBar}>
              <Text style={styles.resultCount}>
                {loading ? "Keresés..." : `${results.length} találat`}
              </Text>
              {/* Hide view switcher on mobile since grid is forced to full-width */}
              {!isMobile && (
                <View style={styles.viewSwitcher}>
                  <TouchableOpacity
                    style={[styles.viewSwitcherButton, viewMode === "grid" && styles.viewSwitcherButtonActive]} // New styles
                    onPress={() => setViewMode("grid")}
                  >
                    <MaterialIcons name="grid-view" size={24} color={viewMode === "grid" ? "#2E7D32" : "#666"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.viewSwitcherButton, viewMode === "list" && styles.viewSwitcherButtonActive]} // New styles
                    onPress={() => setViewMode("list")}
                  >
                    <MaterialIcons name="view-list" size={24} color={viewMode === "list" ? "#2E7D32" : "#666"} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={viewMode === "grid" ? styles.grid : null}>
              {results.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  style={viewMode === "grid"
                    ? [styles.gridItem, isMobile && { width: '100%' }] // Added isMobile style
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
              {/* Removed showEmptyState condition and text */}
              {hasMore && (
                <TouchableOpacity
                  onPress={loadMore}
                  disabled={loading}
                  style={styles.loadMoreButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#2E7D32" />
                  ) : (
                    <Text style={styles.loadMoreText}>További találatok betöltése</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}