import { XIcon } from '../ui/Icons';

export function SavedSearches({ searches, onApply, onDelete }) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-brand-border bg-brand-card p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
        Saved Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <div
            key={search.id}
            className="flex items-center gap-1 rounded-full border border-brand-border bg-brand-dark px-3 py-1"
          >
            <button
              onClick={() => onApply(search.filters)}
              className="text-sm text-brand-text hover:text-brand-accent"
            >
              {search.name}
            </button>
            <button
              onClick={() => onDelete(search.id)}
              className="ml-1 text-brand-muted hover:text-red-400"
              aria-label="Delete saved search"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
