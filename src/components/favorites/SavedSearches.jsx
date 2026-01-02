import { useState, useRef, useEffect } from 'react';
import { XIcon, BookmarkIcon } from '../ui/Icons';

export function SavedSearchesDropdown({
  searches,
  onApply,
  onDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleApply = (filters) => {
    onApply(filters);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
          isOpen
            ? 'border-brand-border bg-brand-card text-brand-text'
            : 'border-brand-border bg-transparent text-brand-text hover:bg-brand-card'
        }`}
      >
        <BookmarkIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Saved</span>
        {searches.length > 0 && (
          <span className="rounded-full bg-brand-accent px-1.5 text-xs font-semibold text-brand-dark">
            {searches.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-brand-border bg-brand-card shadow-lg">
          <div className="border-b border-brand-border px-4 py-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Saved Searches
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {searches.length === 0 ? (
              <p className="px-4 py-3 text-sm text-brand-muted">
                No saved searches yet. Use "Save search" in the filter panel to save your current filters.
              </p>
            ) : (
              <div className="py-1">
                {searches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-brand-border"
                  >
                    <button
                      onClick={() => handleApply(search.filters)}
                      className="flex-1 text-left text-sm text-brand-text hover:text-brand-accent"
                    >
                      {search.name}
                    </button>
                    <button
                      onClick={() => onDelete(search.id)}
                      className="ml-2 p-1 text-brand-muted hover:text-red-400"
                      aria-label={`Delete ${search.name}`}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
