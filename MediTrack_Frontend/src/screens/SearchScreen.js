import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { searchMedications, getFilterOptions } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../theme";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    registrationNumber: "",
    atcCode: "",
    dosageForm: 0,
    activeSubstance: 0,
    marketingAuthorisation: 0,
    dicPrescription: 0,
    lactose: false,
    gluten: false,
    benzoate: false,
    kpBesorolas: false,
    fokozottFelugyelet: false,
  });
  const [dropdownOptions, setDropdownOptions] = useState({
    dosageForms: [],
    activeSubstances: [],
    marketingAuthorisations: [],
    dicPrescriptions: [],
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [isMobile, setIsMobile] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 600;
      setIsMobile(mobile);
      if (mobile) setViewMode("list");
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [dosageForms, activeSubstances, marketingAuthorisations, dicPrescriptions] = await Promise.all([
          getFilterOptions("dosage_form"),
          getFilterOptions("active_substance"),
          getFilterOptions("marketing_authorisation"),
          getFilterOptions("dic_prescription"),
        ]);
        setDropdownOptions({
          dosageForms,
          activeSubstances,
          marketingAuthorisations,
          dicPrescriptions,
        });
      } catch (error) {
        console.error("Hiba a szűrők betöltésekor:", error);
      }
    };
    loadDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() && Object.values(filters).every(v => v === "" || v === false || v === 0)) return;
    setLoading(true);
    try {
      const params = { freetext: searchQuery, ...filters };
      const data = await searchMedications(params);
      setResults(data);
    } catch (error) {
      console.error("Keresés sikertelen:", error);
      setResults([]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const extractItemId = (url) => {
    const match = url.match(/item=(\d+)/);
    return match ? match[1] : null;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          onKeyPress={handleKeyPress}
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
        <TouchableOpacity onPress={() => handleFilterChange("lactose", !filters.lactose)}>
          <Text style={styles.checkbox}>{filters.lactose ? "☑" : "☐"} Laktózmentes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange("gluten", !filters.gluten)}>
          <Text style={styles.checkbox}>{filters.gluten ? "☑" : "☐"} Gluténmentes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange("benzoate", !filters.benzoate)}>
          <Text style={styles.checkbox}>{filters.benzoate ? "☑" : "☐"} Benzoátmentes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange("kpBesorolas", !filters.kpBesorolas)}>
          <Text style={styles.checkbox}>{filters.kpBesorolas ? "☑" : "☐"} Kábítószer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange("fokozottFelugyelet", !filters.fokozottFelugyelet)}>
          <Text style={styles.checkbox}>{filters.fokozottFelugyelet ? "☑" : "☐"} Fokozott felügyelet alatt</Text>
        </TouchableOpacity>
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
            <select
              style={styles.select}
              value={filters.dosageForm}
              onChange={(e) => handleFilterChange("dosageForm", Number(e.target.value))}
            >
              <option value={0}>Gyógyszerforma</option>
              {dropdownOptions.dosageForms.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
            <select
              style={styles.select}
              value={filters.marketingAuthorisation}
              onChange={(e) => handleFilterChange("marketingAuthorisation", Number(e.target.value))}
            >
              <option value={0}>Forgalomba hozó</option>
              {dropdownOptions.marketingAuthorisations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
            <select
              style={styles.select}
              value={filters.dicPrescription}
              onChange={(e) => handleFilterChange("dicPrescription", Number(e.target.value))}
            >
              <option value={0}>Kiadhatóság</option>
              {dropdownOptions.dicPrescriptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>

            {/* Dátum szűrés */}
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
                <TouchableOpacity onPress={() => setViewMode("list")} style={viewMode === "list" ? styles.activeIcon : styles.icon}>
                  <FontAwesome5 name="list" size={20} color={viewMode === "list" ? "grey" : "black"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode("grid")} style={viewMode === "grid" ? styles.activeIcon : styles.icon}>
                  <FontAwesome5 name="th-large" size={20} color={viewMode === "grid" ? "grey" : "black"} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={viewMode === "grid" ? styles.grid : null}>
            {results.map((med, index) => {
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
          </View>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: theme.colors.white,
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#000",
  },
  searchRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#66BB6A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
    width: "100%",
  },
  checkbox: {
    fontSize: 16,
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
  },
  expandFilters: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
  },
  filtersContainer: {
    width: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  filterInput: {
    width: "22%",
    minWidth: 150,
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 46,
    boxSizing: "border-box",
  },
  select: {
    width: "22%",
    minWidth: 150,
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 46,
    boxSizing: "border-box",
  },
  dateInput: {
    width: "22%",
    minWidth: 150,
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 46,
    boxSizing: "border-box",
  },
  loadingWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  viewSwitcher: {
    flexDirection: "row",
    gap: 12,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "flex-start",
  },
  gridItem: {
    width: "30%",
    minWidth: 200,
    backgroundColor: "#fafafa",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  listItem: {
    width: "100%",
    maxWidth: 1200,
    backgroundColor: "#fafafa",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "stretch",
  },  
  medName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  substance: {
    fontSize: 14,
    color: "#555",
  },
  company: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
});
