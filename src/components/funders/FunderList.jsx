import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FunderCard } from './FunderCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

export function FunderList({
  funders,
  expandedId,
  onToggleExpand,
  isFavorite,
  onToggleFavorite,
}) {
  const parentRef = useRef(null);

  // Infinite scroll - show subset of funders, load more as user scrolls
  const {
    visibleItems,
    visibleCount,
    totalCount,
    hasMore,
    isLoadingMore,
  } = useInfiniteScroll(funders, parentRef);

  const getItemSize = useCallback(
    (index) => {
      const funder = visibleItems[index];
      // Expanded cards are taller
      if (funder?.id === expandedId) {
        return 600;
      }
      // Collapsed card height
      return 120;
    },
    [visibleItems, expandedId]
  );

  const virtualizer = useVirtualizer({
    count: visibleItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getItemSize,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  if (funders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-brand-muted">No funders match your criteria</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Results count */}
      <div className="mb-3 text-xs text-brand-muted">
        Showing {visibleCount.toLocaleString()} of {totalCount.toLocaleString()} results
      </div>

      {/* Virtual scroll container */}
      <div
        ref={parentRef}
        className="h-[calc(100vh-320px)] overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((virtualRow) => {
            const funder = visibleItems[virtualRow.index];
            if (!funder) return null;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="pb-2.5">
                  <FunderCard
                    funder={funder}
                    expanded={expandedId === funder.id}
                    onToggle={() => onToggleExpand(funder.id)}
                    isFavorite={isFavorite(funder.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="py-4 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
            <p className="mt-2 text-xs text-brand-muted">Loading more...</p>
          </div>
        )}

        {/* End of results */}
        {!hasMore && visibleCount > 0 && (
          <div className="py-6 text-center text-xs text-brand-muted">
            — End of results —
          </div>
        )}
      </div>
    </div>
  );
}
