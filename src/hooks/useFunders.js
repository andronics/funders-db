import { useMemo } from 'react';
import { searchIndex } from '../lib/searchIndex';

/**
 * Hook for filtering and sorting funders
 */
export function useFunders({
  funders,
  index,
  searchTerm,
  filters,
  sortConfig,
  favorites = [],
  showOnlyFavorites = false,
}) {
  return useMemo(() => {
    if (!funders) return [];

    let results = [...funders];

    // Filter to favorites only if requested
    if (showOnlyFavorites && favorites.length > 0) {
      const favSet = new Set(favorites);
      results = results.filter(f => favSet.has(f.id));
    }

    // Apply search
    if (searchTerm && index) {
      const matchingIds = searchIndex(index, searchTerm);
      if (matchingIds) {
        results = results.filter(f => matchingIds.has(f.id));
      }
    }

    // Apply filters
    if (filters.location) {
      results = results.filter(f => f.locations?.includes(filters.location));
    }
    if (filters.beneficiary) {
      results = results.filter(f => f.beneficiaries?.includes(filters.beneficiary));
    }
    if (filters.focus) {
      results = results.filter(f => f.focus?.includes(filters.focus));
    }
    if (filters.category) {
      results = results.filter(f => f.categories?.includes(filters.category));
    }

    // Apply sort
    const { field, direction } = sortConfig;
    results.sort((a, b) => {
      let aVal, bVal;

      switch (field) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'established':
          aVal = a.established || 0;
          bVal = b.established || 0;
          break;
        case 'grants':
          aVal = a.financial?.grants_to_organisations || 0;
          bVal = b.financial?.grants_to_organisations || 0;
          break;
        case 'assets':
          aVal = a.financial?.assets || 0;
          bVal = b.financial?.assets || 0;
          break;
        default:
          return 0;
      }

      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });

    return results;
  }, [funders, index, searchTerm, filters, sortConfig, favorites, showOnlyFavorites]);
}
