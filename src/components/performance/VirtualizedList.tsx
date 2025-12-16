/**
 * Virtualized List Component - PATCH 831
 * Efficient rendering for large datasets
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
  containerClassName,
  onEndReached,
  endReachedThreshold = 200,
  keyExtractor = (_, index) => String(index),
  emptyComponent,
  loadingComponent,
  isLoading = false,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate item heights
  const getItemHeight = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'function') {
        return itemHeight(index, items[index]);
      }
      return itemHeight;
    },
    [itemHeight, items]
  );

  // Calculate total height and item positions
  const { totalHeight, itemPositions } = useMemo(() => {
    const positions: number[] = [];
    let total = 0;

    items.forEach((_, index) => {
      positions.push(total);
      total += getItemHeight(index);
    });

    return { totalHeight: total, itemPositions: positions };
  }, [items, getItemHeight]);

  // Find visible range
  const { startIndex, endIndex } = useMemo(() => {
    if (items.length === 0) {
      return { startIndex: 0, endIndex: 0 };
    }

    // Binary search for start index
    let start = 0;
    let end = items.length - 1;

    while (start < end) {
      const mid = Math.floor((start + end) / 2);
      if (itemPositions[mid] + getItemHeight(mid) < scrollTop) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    const startIdx = Math.max(0, start - overscan);

    // Find end index
    let endIdx = startIdx;
    let accumulatedHeight = itemPositions[startIdx] || 0;

    while (endIdx < items.length && accumulatedHeight < scrollTop + containerHeight) {
      accumulatedHeight += getItemHeight(endIdx);
      endIdx++;
    }

    endIdx = Math.min(items.length, endIdx + overscan);

    return { startIndex: startIdx, endIndex: endIdx };
  }, [items.length, itemPositions, scrollTop, containerHeight, overscan, getItemHeight]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      // Check if end reached
      if (onEndReached) {
        const distanceFromEnd = totalHeight - (target.scrollTop + target.clientHeight);
        if (distanceFromEnd < endReachedThreshold) {
          onEndReached();
        }
      }
    },
    [totalHeight, endReachedThreshold, onEndReached]
  );

  // Update container height on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  // Render visible items
  const visibleItems = useMemo(() => {
    const visible: React.ReactNode[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      const height = getItemHeight(i);
      const top = itemPositions[i];

      const style: React.CSSProperties = {
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height,
      };

      visible.push(
        <div key={keyExtractor(item, i)} style={style}>
          {renderItem(item, i, style)}
        </div>
      );
    }

    return visible;
  }, [startIndex, endIndex, items, getItemHeight, itemPositions, keyExtractor, renderItem]);

  if (items.length === 0 && !isLoading) {
    return emptyComponent ? <>{emptyComponent}</> : null;
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', containerClassName)}
      onScroll={handleScroll}
    >
      <div
        className={cn('relative', className)}
        style={{ height: totalHeight, minHeight: '100%' }}
      >
        {visibleItems}
      </div>
      {isLoading && loadingComponent}
    </div>
  );
}

// Hook for virtualized data
export function useVirtualizedData<T>(
  fetchFn: (page: number) => Promise<T[]>,
  options: {
    pageSize?: number;
    initialData?: T[];
  } = {}
) {
  const { pageSize = 20, initialData = [] } = options;
  const [items, setItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchFn(page);
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      setItems((prev) => [...prev, ...newItems]);
      setPage((p) => p + 1);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return { items, isLoading, hasMore, loadMore, reset };
}
