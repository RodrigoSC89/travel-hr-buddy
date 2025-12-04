/**
 * PATCH 800: Virtual List Hook for Large Datasets
 * Renders only visible items for better performance
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

interface VirtualListConfig {
  /** Total number of items */
  itemCount: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container in pixels */
  containerHeight: number;
  /** Number of items to render above/below visible area */
  overscan?: number;
}

interface VirtualListResult {
  /** Items to render */
  virtualItems: Array<{ index: number; offsetTop: number }>;
  /** Total height for scroll area */
  totalHeight: number;
  /** Container ref to attach to scrollable element */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Current scroll position */
  scrollTop: number;
  /** Scroll to a specific index */
  scrollToIndex: (index: number) => void;
}

export function useVirtualList({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
}: VirtualListConfig): VirtualListResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(itemCount - 1, start + visibleCount + 2 * overscan);
    
    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const items: Array<{ index: number; offsetTop: number }> = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }
    
    return items;
  }, [startIndex, endIndex, itemHeight]);

  // Handle scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to index function
  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const offset = index * itemHeight;
    container.scrollTo({ top: offset, behavior: "smooth" });
  }, [itemHeight]);

  return {
    virtualItems,
    totalHeight: itemCount * itemHeight,
    containerRef,
    scrollTop,
    scrollToIndex,
  };
}

/**
 * Simple infinite scroll hook
 */
export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  threshold: number = 200
) {
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const element = observerRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          loadMore();
          setTimeout(() => {
            loadingRef.current = false;
          }, 500);
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loadMore, hasMore, threshold]);

  return observerRef;
}
