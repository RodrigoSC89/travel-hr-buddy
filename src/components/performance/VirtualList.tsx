/**
 * VirtualList - High Performance Virtualized List
 * PATCH 880: For rendering large datasets efficiently
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 100,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const endReachedRef = useRef(false);

  // Calculate visible range
  const { startIndex, endIndex, offsetY, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, offsetY, totalHeight };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);

    // Check if end reached
    if (onEndReached && scrollHeight - scrollTop - clientHeight < endReachedThreshold) {
      if (!endReachedRef.current) {
        endReachedRef.current = true;
        onEndReached();
      }
    } else {
      endReachedRef.current = false;
    }
  }, [onEndReached, endReachedThreshold]);

  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      item,
      index: startIndex + i,
    }));
  }, [items, startIndex, endIndex]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items container */}
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              data-index={index}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic height virtual list using react-window style API
 */
interface DynamicVirtualListProps<T> {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, measure: () => void) => React.ReactNode;
  className?: string;
}

export function DynamicVirtualList<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  className,
}: DynamicVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());

  // Calculate positions with dynamic heights
  const { positions, totalHeight, startIndex, endIndex } = useMemo(() => {
    const positions: number[] = [];
    let currentTop = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push(currentTop);
      currentTop += itemHeights.get(i) || estimatedItemHeight;
    }

    const totalHeight = currentTop;

    // Find visible range
    let startIndex = 0;
    let endIndex = items.length - 1;

    for (let i = 0; i < positions.length; i++) {
      if (positions[i] + (itemHeights.get(i) || estimatedItemHeight) >= scrollTop) {
        startIndex = Math.max(0, i - 2);
        break;
      }
    }

    for (let i = startIndex; i < positions.length; i++) {
      if (positions[i] > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + 2);
        break;
      }
    }

    return { positions, totalHeight, startIndex, endIndex };
  }, [items.length, itemHeights, estimatedItemHeight, scrollTop, containerHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const measureItem = useCallback((index: number, height: number) => {
    setItemHeights((prev) => {
      const next = new Map(prev);
      next.set(index, height);
      return next;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {items.slice(startIndex, endIndex + 1).map((item, i) => {
          const index = startIndex + i;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: positions[index],
                left: 0,
                right: 0,
              }}
              ref={(el) => {
                if (el && !itemHeights.has(index)) {
                  measureItem(index, el.getBoundingClientRect().height);
                }
              }}
            >
              {renderItem(item, index, () => {
                const el = containerRef.current?.querySelector(`[data-index="${index}"]`);
                if (el) {
                  measureItem(index, el.getBoundingClientRect().height);
                }
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualList;
