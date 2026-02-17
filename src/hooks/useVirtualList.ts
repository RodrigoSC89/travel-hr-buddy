/**
 * useVirtualList - Performance hook for large lists
 * Wraps @tanstack/react-virtual for consistent virtualization
 */
import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface UseVirtualListOptions<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  horizontal?: boolean;
}

export function useVirtualList<T>({
  items,
  estimateSize = 48,
  overscan = 5,
  horizontal = false,
}: UseVirtualListOptions<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  const visibleItems = useMemo(
    () =>
      virtualItems.map((virtualItem) => ({
        ...virtualItem,
        data: items[virtualItem.index],
      })),
    [virtualItems, items]
  );

  return {
    parentRef,
    virtualizer,
    virtualItems: visibleItems,
    totalSize,
    isEmpty: items.length === 0,
    totalCount: items.length,
  };
}
