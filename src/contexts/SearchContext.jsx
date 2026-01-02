import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const SearchContext = createContext(null);

export function SearchProvider({ children, initialSearchTerm = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [matchesMap, setMatchesMap] = useState(new Map());

  const getMatches = useCallback((funderId) => {
    return matchesMap.get(funderId) || [];
  }, [matchesMap]);

  const value = useMemo(() => ({
    searchTerm,
    setSearchTerm,
    matchesMap,
    setMatchesMap,
    getMatches,
  }), [searchTerm, matchesMap, getMatches]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
