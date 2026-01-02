import Fuse from 'fuse.js';

const FUSE_OPTIONS = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'information_general', weight: 0.2 },
    { name: 'focus', weight: 0.15 },
    { name: 'beneficiaries', weight: 0.1 },
    { name: 'categories', weight: 0.08 },
    { name: 'locations', weight: 0.07 },
  ],
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  findAllMatches: true,
};

/**
 * Create a Fuse.js search index for funders
 */
export function createSearchIndex(funders) {
  return new Fuse(funders, FUSE_OPTIONS);
}

/**
 * Search the index and return results with match data
 * Returns: { ids: Set<string>, matchesMap: Map<string, FuseMatch[]> }
 */
export function searchIndex(index, query, limit = 1000) {
  if (!query || !index) return null;

  const results = index.search(query, { limit });
  const ids = new Set();
  const matchesMap = new Map();

  results.forEach(result => {
    ids.add(result.item.id);
    if (result.matches && result.matches.length > 0) {
      matchesMap.set(result.item.id, result.matches);
    }
  });

  return { ids, matchesMap };
}
