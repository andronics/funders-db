export function SortControls({ sortConfig, onSortChange }) {
  const sortOptions = [
    { field: 'name', label: 'Name' },
    { field: 'established', label: 'Established' },
    { field: 'grants', label: 'Grants' },
    { field: 'assets', label: 'Assets' },
  ];

  const toggleSort = (field) => {
    if (sortConfig.field === field) {
      onSortChange({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({
        field,
        direction: field === 'name' ? 'asc' : 'desc',
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-brand-muted">Sort:</span>
      {sortOptions.map(({ field, label }) => {
        const isActive = sortConfig.field === field;
        return (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs transition-colors ${
              isActive
                ? 'border border-brand-border bg-brand-card text-white'
                : 'border border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            {label}
            {isActive && (
              <span className="text-[10px]">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
