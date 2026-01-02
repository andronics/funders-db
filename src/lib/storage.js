const STORAGE_KEYS = {
  FAVORITES: 'funders-favorites',
  SAVED_SEARCHES: 'funders-saved-searches',
};

/**
 * Get favorites from localStorage
 */
export function getFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save favorites to localStorage
 */
export function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
}

/**
 * Get saved searches from localStorage
 */
export function getSavedSearches() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save searches to localStorage
 */
export function saveSavedSearches(searches) {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(searches));
  } catch (e) {
    console.error('Failed to save searches:', e);
  }
}
