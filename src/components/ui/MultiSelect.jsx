import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

export function MultiSelect({ label, value = [], onChange, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredOptions = search
    ? options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleToggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const displayText = value.length === 0
    ? 'All'
    : value.length === 1
      ? value[0]
      : `${value.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-muted">
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
          isOpen
            ? 'border-brand-accent bg-brand-card'
            : 'border-brand-border bg-brand-card hover:border-brand-accent/50'
        }`}
      >
        <span className={value.length > 0 ? 'text-brand-text' : 'text-brand-muted'}>
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded p-0.5 text-brand-muted hover:bg-brand-border hover:text-white"
              title="Clear all"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <ChevronDownIcon className={`h-4 w-4 text-brand-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-hidden rounded-md border border-brand-border bg-brand-card shadow-lg">
          {/* Search input */}
          {options.length > 10 && (
            <div className="border-b border-brand-border p-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded border border-brand-border bg-brand-dark px-2 py-1 text-sm text-brand-text placeholder-brand-muted focus:border-brand-accent focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-brand-muted">No matches</div>
            ) : (
              filteredOptions.map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-brand-border"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(opt)}
                    onChange={() => handleToggle(opt)}
                    className="h-4 w-4 rounded border-brand-border bg-brand-dark text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-sm text-brand-text">{opt}</span>
                </label>
              ))
            )}
          </div>

          {/* Footer with select all / clear all */}
          {filteredOptions.length > 0 && (
            <div className="flex justify-between border-t border-brand-border px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([...new Set([...value, ...filteredOptions])])}
                className="text-xs text-brand-accent hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter(v => !filteredOptions.includes(v)))}
                className="text-xs text-brand-muted hover:text-white"
              >
                Clear visible
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
