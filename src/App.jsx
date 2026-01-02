import { useState, useCallback } from 'react';
import { FundersProvider, useFundersContext } from './contexts/FundersContext';
import { useFunders } from './hooks/useFunders';
import { useFavorites } from './hooks/useFavorites';
import { useSavedSearches } from './hooks/useSavedSearches';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FilterPanel } from './components/search/FilterPanel';
import { SortControls } from './components/search/SortControls';
import { FunderList } from './components/funders/FunderList';
import { ExportButton } from './components/export/ExportButton';
import { SavedSearches } from './components/favorites/SavedSearches';

function App() {
  return (
    <FundersProvider>
      <FunderBrowser />
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    beneficiary: '',
    focus: '',
    category: '',
  });
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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
    setFilters({ location: '', beneficiary: '', focus: '', category: '' });
    setSearchTerm('');
  }, []);

  const handleSaveSearch = useCallback(() => {
    const name = prompt('Name this search:');
    if (name) {
      saveSearch(name, { ...filters, searchTerm });
    }
  }, [filters, searchTerm, saveSearch]);

  const handleApplySavedSearch = useCallback((savedFilters) => {
    setFilters({
      location: savedFilters.location || '',
      beneficiary: savedFilters.beneficiary || '',
      focus: savedFilters.focus || '',
      category: savedFilters.category || '',
    });
    if (savedFilters.searchTerm) {
      setSearchTerm(savedFilters.searchTerm);
    }
  }, []);

  const hasActiveFilters =
    searchTerm || filters.location || filters.beneficiary || filters.focus || filters.category;
  const activeFilterCount = [
    filters.location,
    filters.beneficiary,
    filters.focus,
    filters.category,
  ].filter(Boolean).length;

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
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Saved searches */}
        <SavedSearches
          searches={savedSearches}
          onApply={handleApplySavedSearch}
          onDelete={deleteSearch}
        />

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-4">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              filterOptions={filterOptions}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              onSaveSearch={handleSaveSearch}
            />
          </div>
        )}

        {/* Results header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SortControls sortConfig={sortConfig} onSortChange={setSortConfig} />
          <ExportButton funders={filteredFunders} />
        </div>

        {/* Funders list */}
        <FunderList
          funders={filteredFunders}
          expandedId={expandedId}
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
