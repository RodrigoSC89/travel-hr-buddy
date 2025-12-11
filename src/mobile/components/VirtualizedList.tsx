/**
 * PATCH 189.0 - Virtualized List Component
 * 
 * High-performance virtualized list for mobile
 * Renders only visible items for smooth scrolling
 */

import React, { memo, useMemo } from "react";
import { useVirtualizedList } from "../hooks/useVirtualizedList";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { cn } from "@/lib/utils";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  keyExtractor?: (item: T, index: number) => string | number;
  loading?: boolean;
  loadingCount?: number;
  emptyMessage?: string;
  gap?: number;
}

/**
 * Virtualized list component for efficient rendering of large lists
 * 
 * @example
 * ```tsx
 * <VirtualizedList
 *   items={missions}
 *   estimateSize={80}
 *   keyExtractor={(item) => item.id}
 *   renderItem={(mission) => <MissionCard mission={mission} />}
 * />
 * ```
 */
function VirtualizedListInner<T>({
  items,
  renderItem,
  estimateSize = 80,
  overscan = 5,
  className,
  containerClassName,
  keyExtractor,
  loading = false,
  loadingCount = 5,
  emptyMessage = "Nenhum item encontrado",
  gap = 8,
}: VirtualizedListProps<T>) {
  const { containerRef, virtualItems, totalSize, isScrolling } = useVirtualizedList({
    items,
    estimateSize: estimateSize + gap,
    overscan,
    getItemKey: keyExtractor 
      ? (index) => keyExtractor(items[index], index)
      : undefined,
  });

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full rounded-lg"
            style={{ height: estimateSize }}
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center py-12 text-muted-foreground",
        className
      )}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full overflow-auto",
        containerClassName
      )}
      style={{ contain: "strict" }}
    >
      <div
        className={cn("relative w-full", className)}
        style={{ height: totalSize }}
      >
        {virtualItems.map(({ item, index, start, key }) => (
          <div
            key={key}
            className="absolute left-0 w-full"
            style={{
              top: start,
              height: estimateSize,
              paddingBottom: gap,
            }}
          >
            {/* Simplified rendering during fast scroll */}
            {isScrolling ? (
              <div 
                className="h-full w-full rounded-lg bg-muted/50 animate-pulse"
                style={{ height: estimateSize - gap }}
              />
            ) : (
              renderItem(item, index)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListInner) as typeof VirtualizedListInner;

/**
 * Grid version of virtualized list
 */
interface VirtualizedGridProps<T> extends VirtualizedListProps<T> {
  columns?: number;
  itemWidth?: number;
}

function VirtualizedGridInner<T>({
  items,
  renderItem,
  estimateSize = 200,
  columns = 2,
  itemWidth,
  gap = 8,
  className,
  containerClassName,
  keyExtractor,
  loading = false,
  loadingCount = 6,
  emptyMessage = "Nenhum item encontrado",
}: VirtualizedGridProps<T>) {
  // Group items into rows
  const rows = useMemo(() => {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns));
    }
    return result;
  }, [items, columns]);

  const { containerRef, virtualItems, totalSize } = useVirtualizedList({
    items: rows,
    estimateSize: estimateSize + gap,
  });

  if (loading) {
    return (
      <div className={cn("grid gap-2", className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full rounded-lg"
            style={{ height: estimateSize }}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center py-12 text-muted-foreground",
        className
      )}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("h-full overflow-auto", containerClassName)}
      style={{ contain: "strict" }}
    >
      <div
        className="relative w-full"
        style={{ height: totalSize }}
      >
        {virtualItems.map(({ item: row, start, key }) => (
          <div
            key={key}
            className="absolute left-0 w-full"
            style={{
              top: start,
              height: estimateSize,
              display: "grid",
              gridTemplateColumns: itemWidth 
                ? `repeat(auto-fill, ${itemWidth}px)` 
                : `repeat(${columns}, 1fr)`,
              gap,
              paddingBottom: gap,
            }}
          >
            {row.map((item, colIndex) => (
              <div key={keyExtractor?.(item, colIndex) ?? colIndex}>
                {renderItem(item, colIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const VirtualizedGrid = memo(VirtualizedGridInner) as typeof VirtualizedGridInner;
