import FlexSearch from 'flexsearch';

/**
 * Create a search index for funders
 */
export function createSearchIndex(funders) {
  const index = new FlexSearch.Document({
    document: {
      id: 'id',
      index: [
        'name',
        'information_general',
        'focus',
        'beneficiaries',
        'categories',
        'locations'
      ],
    },
    tokenize: 'forward',
    optimize: true,
    resolution: 9,
  });

  funders.forEach(funder => {
    index.add({
      id: funder.id,
      name: funder.name,
      information_general: funder.information_general || '',
      focus: (funder.focus || []).join(' '),
      beneficiaries: (funder.beneficiaries || []).join(' '),
      categories: (funder.categories || []).join(' '),
      locations: (funder.locations || []).join(' '),
    });
  });

  return index;
}

/**
 * Search the index and return matching IDs
 */
export function searchIndex(index, query, limit = 1000) {
  if (!query || !index) return null;

  const results = index.search(query, { limit });
  const ids = new Set();

  results.forEach(result => {
    result.result.forEach(id => ids.add(id));
  });

  return ids;
}
