import { useMemo, useEffect } from 'react';
import { searchIndex } from '../lib/searchIndex';
import { useSearchContext } from '../contexts/SearchContext';
import { useDebounce } from './useDebounce';

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
  const { setMatchesMap } = useSearchContext();

  const debouncedSearchTerm = useDebounce(searchTerm, 150);

  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm || !index) return null;
    return searchIndex(index, debouncedSearchTerm);
  }, [index, debouncedSearchTerm]);

  useEffect(() => {
    if (searchResults?.matchesMap) {
      setMatchesMap(searchResults.matchesMap);
    } else {
      setMatchesMap(new Map());
    }
  }, [searchResults, setMatchesMap]);

  return useMemo(() => {
    if (!funders) return [];

    let results = [...funders];

    // Filter to favorites only if requested
    if (showOnlyFavorites && favorites.length > 0) {
      const favSet = new Set(favorites);
      results = results.filter(f => favSet.has(f.id));
    }

    // Apply search
    if (searchResults?.ids) {
      results = results.filter(f => searchResults.ids.has(f.id));
    }

    // Multi-select filters (OR within category, AND across categories)
    if (filters.locations?.length > 0) {
      results = results.filter(f =>
        filters.locations.some(loc => f.locations?.includes(loc))
      );
    }
    if (filters.beneficiaries?.length > 0) {
      results = results.filter(f =>
        filters.beneficiaries.some(ben => f.beneficiaries?.includes(ben))
      );
    }
    if (filters.focus?.length > 0) {
      results = results.filter(f =>
        filters.focus.some(foc => f.focus?.includes(foc))
      );
    }
    if (filters.categories?.length > 0) {
      results = results.filter(f =>
        filters.categories.some(cat => f.categories?.includes(cat))
      );
    }

    // Range filters - grants
    if (filters.grantsMin != null) {
      results = results.filter(f =>
        (f.financial?.grants_to_organisations || 0) >= filters.grantsMin
      );
    }
    if (filters.grantsMax != null) {
      results = results.filter(f =>
        (f.financial?.grants_to_organisations || 0) <= filters.grantsMax
      );
    }

    // Range filters - established year
    if (filters.establishedMin != null) {
      results = results.filter(f =>
        (f.established || 0) >= filters.establishedMin
      );
    }
    if (filters.establishedMax != null) {
      results = results.filter(f =>
        (f.established || 0) <= filters.establishedMax
      );
    }

    // Boolean filter - unsolicited applications
    if (filters.unsolicitedOnly) {
      results = results.filter(f => f.applications_unsolicited === true);
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
  }, [funders, searchResults, filters, sortConfig, favorites, showOnlyFavorites]);
}
