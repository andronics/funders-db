import { MultiSelect } from '../ui/MultiSelect';
import { RangeSlider } from '../ui/RangeSlider';
import { Toggle } from '../ui/Toggle';
import { ChevronDownIcon, ChevronUpIcon, FilterIcon } from '../ui/Icons';

// Format currency for display
function formatCurrency(value) {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}K`;
  }
  return `£${value}`;
}

// Build a human-readable summary of active filters
function buildFilterSummary(filters, activeFilterCount) {
  if (activeFilterCount === 0) return 'No filters active';

  const parts = [];

  // Collect sample values from arrays
  const samples = [
    ...filters.locations.slice(0, 1),
    ...filters.beneficiaries.slice(0, 1),
    ...filters.focus.slice(0, 1),
    ...filters.categories.slice(0, 1),
  ].slice(0, 2);

  if (samples.length > 0) {
    parts.push(samples.join(', '));
  }

  // Add range indicators
  if (filters.grantsMin != null || filters.grantsMax != null) {
    parts.push('Grants range');
  }
  if (filters.establishedMin != null || filters.establishedMax != null) {
    parts.push('Year range');
  }
  if (filters.unsolicitedOnly) {
    parts.push('Unsolicited only');
  }

  // Truncate and add count
  const shown = parts.slice(0, 2).join(', ');
  const remaining = activeFilterCount - Math.min(parts.length, 2);

  if (remaining > 0) {
    return `${shown} +${remaining} more`;
  }
  return shown;
}

function CollapsedFilterBar({
  filters,
  activeFilterCount,
  onExpand,
  onClear,
}) {
  const summary = buildFilterSummary(filters, activeFilterCount);

  return (
    <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-card px-4 py-2">
      <button
        onClick={onExpand}
        className="flex flex-1 items-center gap-2 text-left"
      >
        <FilterIcon className="h-4 w-4 text-brand-muted" />
        <span className="text-sm text-brand-text">{summary}</span>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-brand-accent px-1.5 text-xs font-semibold text-brand-dark">
            {activeFilterCount}
          </span>
        )}
      </button>

      <div className="flex items-center gap-2">
        {activeFilterCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="rounded border border-brand-border px-2 py-1 text-xs text-brand-muted transition-colors hover:bg-brand-border hover:text-brand-text"
          >
            Clear
          </button>
        )}
        <button
          onClick={onExpand}
          className="flex items-center gap-1 rounded border border-brand-border px-2 py-1 text-xs text-brand-muted transition-colors hover:bg-brand-border hover:text-brand-text"
        >
          Expand
          <ChevronDownIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function FilterPanel({
  filters,
  onFilterChange,
  filterOptions,
  onClearFilters,
  hasActiveFilters,
  onSaveSearch,
  isCollapsed = false,
  onToggleCollapse,
  activeFilterCount = 0,
}) {
  const grantsRange = filterOptions?.grantsRange || { min: 0, max: 10000000 };
  const establishedRange = filterOptions?.establishedRange || { min: 1900, max: new Date().getFullYear() };

  // Render collapsed view
  if (isCollapsed) {
    return (
      <CollapsedFilterBar
        filters={filters}
        activeFilterCount={activeFilterCount}
        onExpand={onToggleCollapse}
        onClear={onClearFilters}
      />
    );
  }

  // Render expanded view
  return (
    <div className="rounded-lg border border-brand-border bg-brand-card p-4">
      {/* Collapse button */}
      {onToggleCollapse && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 rounded border border-brand-border px-2 py-1 text-xs text-brand-muted transition-colors hover:bg-brand-border hover:text-brand-text"
          >
            Collapse
            <ChevronUpIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Multi-select filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MultiSelect
          label="Location"
          value={filters.locations}
          onChange={(value) => onFilterChange('locations', value)}
          options={filterOptions?.locations || []}
        />
        <MultiSelect
          label="Beneficiaries"
          value={filters.beneficiaries}
          onChange={(value) => onFilterChange('beneficiaries', value)}
          options={filterOptions?.beneficiaries || []}
        />
        <MultiSelect
          label="Focus Area"
          value={filters.focus}
          onChange={(value) => onFilterChange('focus', value)}
          options={filterOptions?.focus || []}
        />
        <MultiSelect
          label="Funding Type"
          value={filters.categories}
          onChange={(value) => onFilterChange('categories', value)}
          options={filterOptions?.categories || []}
        />
      </div>

      {/* Range sliders */}
      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-brand-border pt-4 sm:grid-cols-2">
        <RangeSlider
          label="Grants Awarded"
          min={grantsRange.min}
          max={grantsRange.max}
          valueMin={filters.grantsMin}
          valueMax={filters.grantsMax}
          onChange={(min, max) => {
            onFilterChange('grantsMin', min);
            onFilterChange('grantsMax', max);
          }}
          formatValue={formatCurrency}
          logarithmic={true}
        />
        <RangeSlider
          label="Year Established"
          min={establishedRange.min}
          max={establishedRange.max}
          valueMin={filters.establishedMin}
          valueMax={filters.establishedMax}
          onChange={(min, max) => {
            onFilterChange('establishedMin', min);
            onFilterChange('establishedMax', max);
          }}
          step={1}
        />
      </div>

      {/* Toggle and actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border pt-4">
        <Toggle
          label="Accepts unsolicited applications"
          checked={filters.unsolicitedOnly}
          onChange={(value) => onFilterChange('unsolicitedOnly', value)}
        />

        <div className="flex gap-2">
          {hasActiveFilters && (
            <>
              <button
                onClick={onClearFilters}
                className="rounded border border-brand-border px-3 py-1.5 text-xs text-brand-muted transition-colors hover:bg-brand-border hover:text-brand-text"
              >
                Clear all
              </button>
              <button
                onClick={onSaveSearch}
                className="rounded border border-brand-accent px-3 py-1.5 text-xs text-brand-accent transition-colors hover:bg-brand-accent hover:text-brand-dark"
              >
                Save search
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
