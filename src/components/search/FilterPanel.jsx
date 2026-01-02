import { FilterSelect } from './FilterSelect';

export function FilterPanel({
  filters,
  onFilterChange,
  filterOptions,
  onClearFilters,
  hasActiveFilters,
  onSaveSearch,
}) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-card p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Location"
          value={filters.location}
          onChange={(value) => onFilterChange('location', value)}
          options={filterOptions?.locations || []}
        />
        <FilterSelect
          label="Beneficiaries"
          value={filters.beneficiary}
          onChange={(value) => onFilterChange('beneficiary', value)}
          options={filterOptions?.beneficiaries || []}
        />
        <FilterSelect
          label="Focus Area"
          value={filters.focus}
          onChange={(value) => onFilterChange('focus', value)}
          options={filterOptions?.focus || []}
        />
        <FilterSelect
          label="Funding Type"
          value={filters.category}
          onChange={(value) => onFilterChange('category', value)}
          options={filterOptions?.categories || []}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-4">
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="rounded border border-brand-border px-3 py-1.5 text-xs text-brand-muted transition-colors hover:bg-brand-border hover:text-brand-text"
            >
              Clear all filters
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onSaveSearch}
            className="rounded border border-brand-accent px-3 py-1.5 text-xs text-brand-accent transition-colors hover:bg-brand-accent hover:text-brand-dark"
          >
            Save this search
          </button>
        )}
      </div>
    </div>
  );
}
