import { useState, useCallback } from 'react';
import { getSavedSearches, saveSavedSearches } from '../lib/storage';

/**
 * Hook for managing saved searches
 */
export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState(() => getSavedSearches());

  const saveSearch = useCallback((name, filters) => {
    const newSearch = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      filters,
    };

    setSavedSearches(prev => {
      const next = [...prev, newSearch];
      saveSavedSearches(next);
      return next;
    });

    return newSearch;
  }, []);

  const deleteSearch = useCallback((searchId) => {
    setSavedSearches(prev => {
      const next = prev.filter(s => s.id !== searchId);
      saveSavedSearches(next);
      return next;
    });
  }, []);

  const clearAllSearches = useCallback(() => {
    setSavedSearches([]);
    saveSavedSearches([]);
  }, []);

  return {
    savedSearches,
    saveSearch,
    deleteSearch,
    clearAllSearches,
  };
}
