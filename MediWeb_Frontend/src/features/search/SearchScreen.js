import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigate } from "react-router-dom";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "./SearchScreen.style";
import { useSearchService } from "./SearchService";

export default function SearchScreen() {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    handleFilterChange,
    results,
    totalCount,
    handleSearch,
    loading,
    filtersExpanded,
    setFiltersExpanded,
    viewMode,
    setViewMode,
    loadMore,
    hasMore,
  } = useSearchService();

  const navigate = useNavigate();
  const showInitialLoading = loading && results.length === 0;
  const trimmedQuery = searchQuery.trim();
  const hasActiveFilters = Boolean(filters.atcCode?.trim() || filters.lactoseFree || filters.glutenFree || filters.benzoateFree || filters.narcoticOnly);
  const showEmptyState = results.length === 0 && !loading && (trimmedQuery.length > 0 || hasActiveFilters);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gyógyszer kereső</Text>

      {/* Kereső sor */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Gyógyszer neve..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Keresés</Text>
        </TouchableOpacity>
      </View>

      {/* Gyors szűrés checkboxok */}
      <View style={styles.checkboxRow}>
        {[
          { field: "lactoseFree", label: "Laktózmentes" },
          { field: "glutenFree", label: "Gluténmentes" },
          { field: "benzoateFree", label: "Benzoátmentes" },
          { field: "narcoticOnly", label: "Kábítószer" },
        ].map(({ field, label }) => (
          <TouchableOpacity key={field} onPress={() => handleFilterChange(field, !filters[field])}>
            <Text style={styles.checkbox}>{filters[field] ? "☑" : "☐"} {label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Részletes szűrés */}
      <TouchableOpacity onPress={() => setFiltersExpanded(!filtersExpanded)}>
        <Text style={styles.expandFilters}>{filtersExpanded ? "Szűrők elrejtése ▲" : "Részletes szűrés ▼"}</Text>
      </TouchableOpacity>

      {filtersExpanded && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterGrid}>
            <TextInput
              style={styles.filterInput}
              placeholder="ATC kód"
              value={filters.atcCode}
              onChangeText={(text) => handleFilterChange("atcCode", text)}
            />
          </View>
        </View>
      )}

      {/* Találatok */}
      {showInitialLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#66BB6A" />
        </View>
      ) : (
        <>
          {results.length > 0 && (
            <View style={styles.topBar}>
              <Text style={styles.resultCount}>Találatok: {totalCount}</Text>
              <View style={styles.viewSwitcher}>
                <TouchableOpacity onPress={() => setViewMode("list")}>
                  <FontAwesome5 name="list" size={20} color={viewMode === "list" ? "grey" : "black"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode("grid")}>
                  <FontAwesome5 name="th-large" size={20} color={viewMode === "grid" ? "grey" : "black"} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={viewMode === "grid" ? styles.grid : null}>
            {results.map((med) => (
              <TouchableOpacity
                key={med.id}
                style={viewMode === "grid" ? styles.gridItem : styles.listItem}
                onPress={() => navigate(`/medication/${med.id}`)}
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
            {showEmptyState && (
              <Text style={styles.emptyState}>Nincs találat a megadott feltételekkel.</Text>
            )}
            {hasMore && (
              <TouchableOpacity
                onPress={loadMore}
                disabled={loading}
                style={styles.loadMoreButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#333" />
                ) : (
                  <Text style={styles.loadMoreText}>További találatok betöltése</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}