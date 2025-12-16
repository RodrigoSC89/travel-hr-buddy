/**
 * PATCH 189.0 - Virtualized List Hook
 * 
 * High-performance list virtualization for mobile
 * Uses @tanstack/react-virtual for efficient rendering
 */

import { useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface VirtualizedListOptions<T> {
  items: T[];
  estimateSize: number;
  overscan?: number;
  horizontal?: boolean;
  getItemKey?: (index: number) => string | number;
  paddingStart?: number;
  paddingEnd?: number;
}

export interface VirtualizedListResult<T> {
  containerRef: React.RefObject<HTMLDivElement>;
  virtualItems: Array<{
    index: number;
    start: number;
    size: number;
    key: string | number | bigint;
    item: T;
  }>;
  totalSize: number;
  scrollToIndex: (index: number, options?: { align?: "start" | "center" | "end" }) => void;
  measureElement: (node: Element | null) => void;
  isScrolling: boolean;
}

/**
 * Hook for virtualizing large lists
 * 
 * @example
 * ```tsx
 * const { containerRef, virtualItems, totalSize } = useVirtualizedList({
 *   items: missions,
 *   estimateSize: 80,
 *   overscan: 5
 * });
 * 
 * return (
 *   <div ref={containerRef} style={{ height: '100%', overflow: 'auto' }}>
 *     <div style={{ height: totalSize, position: 'relative' }}>
 *       {virtualItems.map(({ item, index, start, size }) => (
 *         <div
 *           key={item.id}
 *           style={{
 *             position: 'absolute',
 *             top: start,
 *             height: size,
 *             width: '100%'
 *           }}
 *         >
 *           <MissionCard mission={item} />
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useVirtualizedList<T>({
  items,
  estimateSize,
  overscan = 5,
  horizontal = false,
  getItemKey,
  paddingStart = 0,
  paddingEnd = 0,
}: VirtualizedListOptions<T>): VirtualizedListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
    getItemKey: getItemKey || ((index) => index),
    paddingStart,
    paddingEnd,
  });

  const virtualItems = useMemo(() => {
    return virtualizer.getVirtualItems().map((virtualItem) => ({
      index: virtualItem.index,
      start: virtualItem.start,
      size: virtualItem.size,
      key: virtualItem.key,
      item: items[virtualItem.index],
    }));
  }, [virtualizer.getVirtualItems(), items]);

  const scrollToIndex = useCallback(
    (index: number, options?: { align?: "start" | "center" | "end" }) => {
      virtualizer.scrollToIndex(index, options);
    },
    [virtualizer]
  );

  const measureElement = useCallback(
    (node: Element | null) => {
      if (node) {
        virtualizer.measureElement(node);
      }
    },
    [virtualizer]
  );

  return {
    containerRef,
    virtualItems,
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex,
    measureElement,
    isScrolling: virtualizer.isScrolling,
  };
}

/**
 * Hook for infinite scrolling with virtualization
 */
export function useInfiniteVirtualList<T>({
  items,
  estimateSize,
  overscan = 5,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 5,
}: VirtualizedListOptions<T> & {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
}) {
  const result = useVirtualizedList({
    items,
    estimateSize,
    overscan,
  });

  // Check if we need to load more
  const lastItem = result.virtualItems[result.virtualItems.length - 1];
  
  if (
    lastItem &&
    lastItem.index >= items.length - threshold &&
    hasNextPage &&
    !isFetchingNextPage
  ) {
    fetchNextPage();
  }

  return {
    ...result,
    hasNextPage,
    isFetchingNextPage,
  };
}
