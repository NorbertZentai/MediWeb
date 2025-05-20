import { useState, useEffect, useCallback } from "react";
import { searchMedications, getFilterOptions } from "./search.api";
import { debounce } from "lodash";

export function useSearchService() {
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
    authorisationDateFrom: "",
    authorisationDateTo: "",
    revokeDateFrom: "",
    revokeDateTo: "",
  });
  const [dropdownOptions, setDropdownOptions] = useState({
    dosageForms: [],
    activeSubstances: [],
    marketingAuthorisations: [],
    dicPrescriptions: [],
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [isMobile, setIsMobile] = useState(false);

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

  const handleSearch = async () => {
    if (!searchQuery.trim() && Object.values(filters).every(v => v === "" || v === false || v === 0)) {
      setResults([]);
      return;
    }
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

  const debouncedSearch = useCallback(debounce(handleSearch, 500), [searchQuery, filters]);

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
    if (searchQuery.length >= 3) {
      debouncedSearch();
    } else {
      setResults([]);
    }
    return debouncedSearch.cancel;
  }, [searchQuery, filters, debouncedSearch]);

  return {
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
  };
}