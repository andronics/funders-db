import { SearchIcon, FilterIcon, HeartIcon } from '../ui/Icons';

export function Header({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  filteredCount,
  totalCount,
  favoritesCount,
  showFavorites,
  onToggleFavorites,
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-dark">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        {/* Title row */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">
              UK Funders Database
            </h1>
            <p className="mt-1 text-xs text-brand-muted">
              {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} funders
            </p>
          </div>

          <div className="flex gap-2">
            {/* Favorites toggle */}
            <button
              onClick={onToggleFavorites}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                showFavorites
                  ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                  : 'border-brand-border bg-transparent text-brand-text hover:bg-brand-card'
              }`}
              aria-pressed={showFavorites}
            >
              <HeartIcon filled={showFavorites} className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className="rounded-full bg-brand-accent px-1.5 text-xs font-semibold text-brand-dark">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Filters toggle */}
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                showFilters
                  ? 'border-brand-border bg-brand-card text-brand-text'
                  : 'border-brand-border bg-transparent text-brand-text hover:bg-brand-card'
              }`}
              aria-expanded={showFilters}
            >
              <FilterIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-brand-accent px-1.5 text-xs font-semibold text-brand-dark">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by name, focus area, or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-brand-border bg-brand-card py-3 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted outline-none transition-colors focus:border-brand-accent"
          />
        </div>
      </div>
    </header>
  );
}
