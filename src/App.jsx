import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { FundersProvider, useFundersContext } from './contexts/FundersContext';
import { SearchProvider, useSearchContext } from './contexts/SearchContext';
import { useFunders } from './hooks/useFunders';
import { useFavorites } from './hooks/useFavorites';
import { useSavedSearches } from './hooks/useSavedSearches';
import { getInitialStateFromUrl, useUrlState } from './hooks/useUrlState';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FilterPanel } from './components/search/FilterPanel';
import { SortControls } from './components/search/SortControls';
import { FunderList } from './components/funders/FunderList';
import { ExportButton } from './components/export/ExportButton';

// Read initial state from URL once at module load
const initialUrlState = getInitialStateFromUrl();

// Default filter state
const DEFAULT_FILTERS = {
  locations: [],
  beneficiaries: [],
  focus: [],
  categories: [],
  grantsMin: null,
  grantsMax: null,
  establishedMin: null,
  establishedMax: null,
  unsolicitedOnly: false,
};

function App() {
  return (
    <FundersProvider>
      <SearchProvider initialSearchTerm={initialUrlState.searchTerm}>
        <FunderBrowser />
      </SearchProvider>
    </FundersProvider>
  );
}

function FunderBrowser() {
  const {
    funders,
    filterOptions,
    searchIndex,
    isLoading,
    loadingProgress,
    loadingStatus,
    error,
    totalCount
  } = useFundersContext();

  const { searchTerm, setSearchTerm } = useSearchContext();
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialUrlState.filters,
  });
  const [sortConfig, setSortConfig] = useState(initialUrlState.sortConfig);

  // Sync state to URL
  useUrlState({ searchTerm, filters, sortConfig });

  // Auto-show filters if any are active from URL
  const hasUrlFilters = !!(
    initialUrlState.filters.locations?.length > 0 ||
    initialUrlState.filters.beneficiaries?.length > 0 ||
    initialUrlState.filters.focus?.length > 0 ||
    initialUrlState.filters.categories?.length > 0 ||
    initialUrlState.filters.grantsMin != null ||
    initialUrlState.filters.grantsMax != null ||
    initialUrlState.filters.establishedMin != null ||
    initialUrlState.filters.establishedMax != null ||
    initialUrlState.filters.unsolicitedOnly
  );
  const [showFilters, setShowFilters] = useState(hasUrlFilters);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [expandedId, setExpandedId] = useState(initialUrlState.expandedFunderId);

  // Auto-collapse filters on scroll down
  const lastScrollY = useRef(0);
  useEffect(() => {
    if (!showFilters) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Collapse when scrolling down past threshold
      if (currentScrollY > 150 && currentScrollY > lastScrollY.current + 50) {
        setIsFiltersCollapsed(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showFilters]);

  // Expand filters when toggled on
  useEffect(() => {
    if (showFilters) {
      setIsFiltersCollapsed(false);
    }
  }, [showFilters]);

  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useFavorites();
  const { savedSearches, saveSearch, deleteSearch } = useSavedSearches();

  const filteredFunders = useFunders({
    funders,
    index: searchIndex,
    searchTerm,
    filters,
    sortConfig,
    favorites,
    showOnlyFavorites,
  });

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleSaveSearch = useCallback(() => {
    const name = prompt('Name this search:');
    if (name) {
      saveSearch(name, { ...filters, searchTerm });
    }
  }, [filters, searchTerm, saveSearch]);

  const handleApplySavedSearch = useCallback((savedFilters) => {
    setFilters({
      ...DEFAULT_FILTERS,
      locations: savedFilters.locations || [],
      beneficiaries: savedFilters.beneficiaries || [],
      focus: savedFilters.focus || [],
      categories: savedFilters.categories || [],
      grantsMin: savedFilters.grantsMin ?? null,
      grantsMax: savedFilters.grantsMax ?? null,
      establishedMin: savedFilters.establishedMin ?? null,
      establishedMax: savedFilters.establishedMax ?? null,
      unsolicitedOnly: savedFilters.unsolicitedOnly || false,
    });
    if (savedFilters.searchTerm) {
      setSearchTerm(savedFilters.searchTerm);
    }
  }, [setSearchTerm]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.locations.length > 0) count++;
    if (filters.beneficiaries.length > 0) count++;
    if (filters.focus.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.grantsMin != null || filters.grantsMax != null) count++;
    if (filters.establishedMin != null || filters.establishedMax != null) count++;
    if (filters.unsolicitedOnly) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = searchTerm || activeFilterCount > 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <div className="w-80 text-center">
          {/* Progress bar */}
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-brand-card">
            <div
              className="h-full bg-brand-accent transition-all duration-300 ease-out"
              style={{ width: `${Math.round(loadingProgress * 100)}%` }}
            />
          </div>

          {/* Status text */}
          <p className="text-sm text-brand-muted">{loadingStatus}</p>

          {/* Show count while streaming */}
          {funders.length > 0 && (
            <p className="mt-1 text-xs text-brand-accent">
              {funders.length.toLocaleString()} funders loaded
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <div className="text-center">
          <p className="mb-2 text-lg text-red-400">Failed to load data</p>
          <p className="text-sm text-brand-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFilterCount={activeFilterCount}
        filteredCount={filteredFunders.length}
        totalCount={totalCount}
        favoritesCount={favoritesCount}
        showFavorites={showOnlyFavorites}
        onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
        savedSearches={savedSearches}
        onApplySavedSearch={handleApplySavedSearch}
        onDeleteSavedSearch={deleteSearch}
      >
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            onSaveSearch={handleSaveSearch}
            isCollapsed={isFiltersCollapsed}
            onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
            activeFilterCount={activeFilterCount}
          />
        )}
      </Header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Results header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SortControls sortConfig={sortConfig} onSortChange={setSortConfig} />
          <ExportButton funders={filteredFunders} />
        </div>

        {/* Funders list */}
        <FunderList
          funders={filteredFunders}
          expandedId={expandedId}
          initialExpandedFunderId={initialUrlState.expandedFunderId}
          onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
