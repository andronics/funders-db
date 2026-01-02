import { useEffect, useCallback, useRef } from 'react';

/**
 * URL parameter keys
 */
const PARAM_KEYS = {
  search: 'q',
  location: 'location',
  beneficiary: 'beneficiary',
  focus: 'focus',
  category: 'category',
  sortField: 'sort',
  sortDir: 'dir',
};

/**
 * Read initial state from URL parameters
 */
export function getInitialStateFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    searchTerm: params.get(PARAM_KEYS.search) || '',
    filters: {
      location: params.get(PARAM_KEYS.location) || '',
      beneficiary: params.get(PARAM_KEYS.beneficiary) || '',
      focus: params.get(PARAM_KEYS.focus) || '',
      category: params.get(PARAM_KEYS.category) || '',
    },
    sortConfig: {
      field: params.get(PARAM_KEYS.sortField) || 'name',
      direction: params.get(PARAM_KEYS.sortDir) || 'asc',
    },
  };
}

/**
 * Hook to sync search/filter/sort state with URL
 */
export function useUrlState({ searchTerm, filters, sortConfig }) {
  const isInitialMount = useRef(true);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    // Only add non-empty values
    if (searchTerm) {
      params.set(PARAM_KEYS.search, searchTerm);
    }
    if (filters.location) {
      params.set(PARAM_KEYS.location, filters.location);
    }
    if (filters.beneficiary) {
      params.set(PARAM_KEYS.beneficiary, filters.beneficiary);
    }
    if (filters.focus) {
      params.set(PARAM_KEYS.focus, filters.focus);
    }
    if (filters.category) {
      params.set(PARAM_KEYS.category, filters.category);
    }

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
  if (filters.location) params.set(PARAM_KEYS.location, filters.location);
  if (filters.beneficiary) params.set(PARAM_KEYS.beneficiary, filters.beneficiary);
  if (filters.focus) params.set(PARAM_KEYS.focus, filters.focus);
  if (filters.category) params.set(PARAM_KEYS.category, filters.category);
  if (sortConfig.field !== 'name' || sortConfig.direction !== 'asc') {
    params.set(PARAM_KEYS.sortField, sortConfig.field);
    params.set(PARAM_KEYS.sortDir, sortConfig.direction);
  }

  const queryString = params.toString();
  return queryString
    ? `${window.location.origin}${window.location.pathname}?${queryString}`
    : `${window.location.origin}${window.location.pathname}`;
}
