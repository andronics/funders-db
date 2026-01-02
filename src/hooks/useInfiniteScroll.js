import { useState, useCallback, useEffect, useRef } from 'react';

const INITIAL_ITEMS = 50;
const LOAD_MORE_COUNT = 25;
const SCROLL_THRESHOLD = 200; // pixels from bottom

/**
 * Hook for infinite scroll behavior
 * Shows a subset of items and loads more as user scrolls
 */
export function useInfiniteScroll(items, scrollElementRef) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Track items reference to detect changes
  const itemsRef = useRef(items);

  // Get visible slice of items
  const visibleItems = items.slice(0, Math.min(visibleCount, items.length));
  const hasMore = visibleCount < items.length;

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    // Small delay for visual feedback
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, items.length));
      setIsLoadingMore(false);
    }, 100);
  }, [isLoadingMore, hasMore, items.length]);

  // Reset when items array changes (e.g., filter applied)
  useEffect(() => {
    // Check if items array reference changed (new filter/sort applied)
    if (itemsRef.current !== items) {
      itemsRef.current = items;
      setVisibleCount(INITIAL_ITEMS);

      // Scroll to top when items change
      if (scrollElementRef?.current) {
        scrollElementRef.current.scrollTop = 0;
      }
    }
  }, [items, scrollElementRef]);

  // Scroll detection
  useEffect(() => {
    const scrollElement = scrollElementRef?.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < SCROLL_THRESHOLD && hasMore && !isLoadingMore) {
        loadMore();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [scrollElementRef, hasMore, isLoadingMore, loadMore]);

  return {
    visibleItems,
    visibleCount: Math.min(visibleCount, items.length),
    totalCount: items.length,
    hasMore,
    isLoadingMore,
    loadMore,
  };
}
