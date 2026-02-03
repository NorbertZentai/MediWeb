import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { searchMedications } from "./search.api";

export function useSearchService() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    atcCode: "",
    registrationNumber: "",
    authorisationDateFrom: "",
    authorisationDateTo: "",
    revokeDateFrom: "",
    revokeDateTo: "",
    // Boolean filters
    lactoseFree: false,
    glutenFree: false,
    benzoateFree: false,
    narcoticOnly: false,
    hasFinalSample: false,
    hasDefectedForm: false,
    fokozottFelugyelet: false,
  });
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const hasActiveFilters = useCallback(() => (
    Boolean(filters.atcCode?.trim())
    || Boolean(filters.registrationNumber?.trim())
    || Boolean(filters.authorisationDateFrom?.trim())
    || Boolean(filters.authorisationDateTo?.trim())
    || Boolean(filters.revokeDateFrom?.trim())
    || Boolean(filters.revokeDateTo?.trim())
    || filters.lactoseFree
    || filters.glutenFree
    || filters.benzoateFree
    || filters.narcoticOnly
    || filters.hasFinalSample
    || filters.hasDefectedForm
    || filters.fokozottFelugyelet
  ), [filters]);

  const resetState = useCallback(() => {
    setResults([]);
    setTotalCount(0);
    setHasMore(false);
    setPage(0);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchPage = useCallback(async (targetPage = 0, append = false) => {
    const trimmedQuery = searchQuery.trim();
    const hasQuery = trimmedQuery.length > 0;
    const filtersActive = hasActiveFilters();

    if (!hasQuery && !filtersActive) {
      resetState();
      return;
    }

    if (!append && targetPage === 0) {
      setResults([]);
      setTotalCount(0);
      setHasMore(false);
      setPage(0);
    }

    setLoading(true);
    try {
      const params = {
        q: hasQuery ? trimmedQuery : undefined,
        atc: filters.atcCode?.trim() || undefined,
        registrationNumber: filters.registrationNumber?.trim() || undefined,
        authorisationDateFrom: filters.authorisationDateFrom?.trim() || undefined,
        authorisationDateTo: filters.authorisationDateTo?.trim() || undefined,
        revokeDateFrom: filters.revokeDateFrom?.trim() || undefined,
        revokeDateTo: filters.revokeDateTo?.trim() || undefined,
        lactoseFree: filters.lactoseFree || undefined,
        glutenFree: filters.glutenFree || undefined,
        benzoateFree: filters.benzoateFree || undefined,
        narcoticOnly: filters.narcoticOnly || undefined,
        hasFinalSample: filters.hasFinalSample || undefined,
        hasDefectedForm: filters.hasDefectedForm || undefined,
        fokozottFelugyelet: filters.fokozottFelugyelet || undefined,
        page: targetPage,
        size: 40,
      };

      const data = await searchMedications(params);
      const content = data?.content ?? [];
      setResults((prev) => (append ? [...prev, ...content] : content));
      setTotalCount(data?.totalElements ?? content.length);
      setPage(targetPage);
      setHasMore(!(data?.last ?? true));
    } catch (error) {
      console.error("Keresés sikertelen:", error);
      if (!append) {
        resetState();
      }
    } finally {
      setLoading(false);
    }
  }, [filters, hasActiveFilters, resetState, searchQuery]);

  const handleSearch = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }
    await fetchPage(page + 1, true);
  }, [fetchPage, hasMore, loading, page]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleResize = () => {
        const mobile = window.innerWidth < 600;
        if (mobile) setViewMode("list");
      };
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const trimmedLength = searchQuery.trim().length;
    const filtersActive = hasActiveFilters();

    if (trimmedLength === 0 && !filtersActive) {
      resetState();
      return;
    }

    if (trimmedLength < 3 && !filtersActive) {
      return;
    }

    const timeout = setTimeout(() => {
      fetchPage(0, false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [fetchPage, hasActiveFilters, resetState, searchQuery]);

  return {
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
  };
}