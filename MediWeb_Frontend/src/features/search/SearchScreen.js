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
    dropdownOptions,
    results,
    handleSearch,
    loading,
    filtersExpanded,
    setFiltersExpanded,
    viewMode,
    setViewMode,
    isMobile,
    extractItemId,
  } = useSearchService();

  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = React.useState(12);

  React.useEffect(() => {
    setVisibleCount(12);
  }, [results]);
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
        <select
          style={styles.select}
          value={filters.activeSubstance}
          onChange={(e) => handleFilterChange("activeSubstance", Number(e.target.value))}
        >
          <option value={0}>Hatóanyag</option>
          {dropdownOptions.activeSubstances.map((option) => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Keresés</Text>
        </TouchableOpacity>
      </View>

      {/* Gyors szűrés checkboxok */}
      <View style={styles.checkboxRow}>
        {[
          { field: "lactose", label: "Laktózmentes" },
          { field: "gluten", label: "Gluténmentes" },
          { field: "benzoate", label: "Benzoátmentes" },
          { field: "kpBesorolas", label: "Kábítószer" },
          { field: "fokozottFelugyelet", label: "Fokozott felügyelet alatt" },
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
            {["dosageForm", "marketingAuthorisation", "dicPrescription"].map((key) => (
              <select
                key={key}
                style={styles.select}
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, Number(e.target.value))}
              >
                <option value={0}>
                  {{
                    dosageForm: "Gyógyszerforma",
                    marketingAuthorisation: "Forgalomba hozó",
                    dicPrescription: "Kiadhatóság",
                  }[key]}
                </option>
                {dropdownOptions[`${key}s`]?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            ))}
            <input
              type="date"
              style={styles.dateInput}
              value={filters.authorisationDateFrom}
              onChange={(e) => handleFilterChange("authorisationDateFrom", e.target.value)}
              placeholder="Engedélyezés -tól"
            />
            <input
              type="date"
              style={styles.dateInput}
              value={filters.authorisationDateTo}
              onChange={(e) => handleFilterChange("authorisationDateTo", e.target.value)}
              placeholder="Engedélyezés -ig"
            />
            <input
              type="date"
              style={styles.dateInput}
              value={filters.revokeDateFrom}
              onChange={(e) => handleFilterChange("revokeDateFrom", e.target.value)}
              placeholder="Visszavonás -tól"
            />
            <input
              type="date"
              style={styles.dateInput}
              value={filters.revokeDateTo}
              onChange={(e) => handleFilterChange("revokeDateTo", e.target.value)}
              placeholder="Visszavonás -ig"
            />
          </View>
        </View>
      )}

      {/* Találatok */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#66BB6A" />
        </View>
      ) : (
        <>
          {results.length > 0 && (
            <View style={styles.topBar}>
              <Text style={styles.resultCount}>Találatok: {results.length}</Text>
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
            {results.slice(0, visibleCount ).map((med, index) => {
              const itemId = extractItemId(med.link);
              return (
                <TouchableOpacity
                  key={index}
                  style={viewMode === "grid" ? styles.gridItem : styles.listItem}
                  onPress={() => navigate(`/medication/${itemId}`)}
                >
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.substance}>{med.substance}</Text>
                  <Text style={styles.company}>{med.company}</Text>
                  <Text style={styles.status}>{med.status}</Text>
                </TouchableOpacity>
              );
            })}
            {results.length > visibleCount && (
              <TouchableOpacity onPress={() => setVisibleCount((prev) => prev + 12)} style={styles.loadMoreButton}>
                <Text style={styles.loadMoreText}>További találatok betöltése</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}