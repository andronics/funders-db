import { useEffect, useCallback, useRef } from 'react';

/**
 * URL parameter keys (short names for cleaner URLs)
 */
const PARAM_KEYS = {
  search: 'q',
  // Multi-select filters (arrays)
  locations: 'loc',
  beneficiaries: 'ben',
  focus: 'focus',
  categories: 'cat',
  // Range filters
  grantsMin: 'gmin',
  grantsMax: 'gmax',
  establishedMin: 'emin',
  establishedMax: 'emax',
  // Boolean
  unsolicitedOnly: 'unsol',
  // Sort
  sortField: 'sort',
  sortDir: 'dir',
  // Funder detail
  funder: 'funder',
};

/**
 * Parse array from comma-separated URL param
 */
function parseArray(value) {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

/**
 * Parse number from URL param
 */
function parseNumber(value) {
  if (!value) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Read initial state from URL parameters
 */
export function getInitialStateFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    searchTerm: params.get(PARAM_KEYS.search) || '',
    filters: {
      // Multi-select arrays
      locations: parseArray(params.get(PARAM_KEYS.locations)),
      beneficiaries: parseArray(params.get(PARAM_KEYS.beneficiaries)),
      focus: parseArray(params.get(PARAM_KEYS.focus)),
      categories: parseArray(params.get(PARAM_KEYS.categories)),
      // Range filters
      grantsMin: parseNumber(params.get(PARAM_KEYS.grantsMin)),
      grantsMax: parseNumber(params.get(PARAM_KEYS.grantsMax)),
      establishedMin: parseNumber(params.get(PARAM_KEYS.establishedMin)),
      establishedMax: parseNumber(params.get(PARAM_KEYS.establishedMax)),
      // Boolean
      unsolicitedOnly: params.get(PARAM_KEYS.unsolicitedOnly) === '1',
    },
    sortConfig: {
      field: params.get(PARAM_KEYS.sortField) || 'name',
      direction: params.get(PARAM_KEYS.sortDir) || 'asc',
    },
    expandedFunderId: params.get(PARAM_KEYS.funder) || null,
  };
}

/**
 * Add filters to URL params (only non-empty values)
 */
function addFiltersToParams(params, filters) {
  // Multi-select arrays
  if (filters.locations?.length > 0) {
    params.set(PARAM_KEYS.locations, filters.locations.join(','));
  }
  if (filters.beneficiaries?.length > 0) {
    params.set(PARAM_KEYS.beneficiaries, filters.beneficiaries.join(','));
  }
  if (filters.focus?.length > 0) {
    params.set(PARAM_KEYS.focus, filters.focus.join(','));
  }
  if (filters.categories?.length > 0) {
    params.set(PARAM_KEYS.categories, filters.categories.join(','));
  }

  // Range filters
  if (filters.grantsMin != null) {
    params.set(PARAM_KEYS.grantsMin, filters.grantsMin.toString());
  }
  if (filters.grantsMax != null) {
    params.set(PARAM_KEYS.grantsMax, filters.grantsMax.toString());
  }
  if (filters.establishedMin != null) {
    params.set(PARAM_KEYS.establishedMin, filters.establishedMin.toString());
  }
  if (filters.establishedMax != null) {
    params.set(PARAM_KEYS.establishedMax, filters.establishedMax.toString());
  }

  // Boolean
  if (filters.unsolicitedOnly) {
    params.set(PARAM_KEYS.unsolicitedOnly, '1');
  }
}

/**
 * Hook to sync search/filter/sort state with URL
 */
export function useUrlState({ searchTerm, filters, sortConfig }) {
  const isInitialMount = useRef(true);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    // Search term
    if (searchTerm) {
      params.set(PARAM_KEYS.search, searchTerm);
    }

    // Add filters
    addFiltersToParams(params, filters);

    // Only add sort if not default
    if (sortConfig.field !== 'name' || sortConfig.direction !== 'asc') {
      params.set(PARAM_KEYS.sortField, sortConfig.field);
      params.set(PARAM_KEYS.sortDir, sortConfig.direction);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    // Use replaceState to avoid polluting browser history
    window.history.replaceState(null, '', newUrl);
  }, [searchTerm, filters, sortConfig]);

  // Update URL when state changes (skip initial mount to avoid double-setting)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    updateUrl();
  }, [updateUrl]);

  return { updateUrl };
}

/**
 * Generate a shareable URL for current state
 */
export function generateShareableUrl(searchTerm, filters, sortConfig) {
  const params = new URLSearchParams();

  if (searchTerm) params.set(PARAM_KEYS.search, searchTerm);

  addFiltersToParams(params, filters);

  if (sortConfig.field !== 'name' || sortConfig.direction !== 'asc') {
    params.set(PARAM_KEYS.sortField, sortConfig.field);
    params.set(PARAM_KEYS.sortDir, sortConfig.direction);
  }

  const queryString = params.toString();
  return queryString
    ? `${window.location.origin}${window.location.pathname}?${queryString}`
    : `${window.location.origin}${window.location.pathname}`;
}
