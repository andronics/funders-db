import { useState, useCallback } from 'react';
import { getFavorites, saveFavorites } from '../lib/storage';

/**
 * Hook for managing favorite funders
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => getFavorites());

  const toggleFavorite = useCallback((funderId) => {
    setFavorites(prev => {
      const next = prev.includes(funderId)
        ? prev.filter(id => id !== funderId)
        : [...prev, funderId];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((funderId) => {
    return favorites.includes(funderId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
}
