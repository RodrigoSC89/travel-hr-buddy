/**
 * Virtual Scroll Utilities - PATCH 835
 * Memory-efficient list rendering for large datasets
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { bandwidthOptimizer } from './low-bandwidth-optimizer';

interface VirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

interface VirtualScrollResult<T> {
  virtualItems: Array<{ item: T; index: number; style: React.CSSProperties }>;
  totalHeight: number;
  containerProps: {
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLElement>) => void;
    ref: React.RefObject<HTMLElement>;
  };
  innerProps: {
    style: React.CSSProperties;
  };
}

/**
 * Virtual scroll hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
): VirtualScrollResult<T> {
  const { itemHeight, overscan: customOverscan, containerHeight } = options;
  const containerRef = useRef<HTMLElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(containerHeight || 400);
  
  // Adaptive overscan based on connection
  const config = bandwidthOptimizer.getConfig();
  const connectionType = bandwidthOptimizer.getConnectionType();
  const overscan = customOverscan ?? (connectionType === '4g' ? 5 : 2);
  
  // Calculate visible range
  const { startIndex, endIndex, virtualItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(height / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);
    
    const virtual = [];
    for (let i = start; i <= end; i++) {
      virtual.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }
    
    return { startIndex: start, endIndex: end, virtualItems: virtual };
  }, [items, scrollTop, height, itemHeight, overscan]);
  
  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  // Observe container size
  useEffect(() => {
    if (!containerRef.current || containerHeight) return;
    
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setHeight(entry.contentRect.height);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerHeight]);
  
  const totalHeight = items.length * itemHeight;
  
  return {
    virtualItems,
    totalHeight,
    containerProps: {
      style: {
        height: containerHeight || '100%',
        overflow: 'auto',
        position: 'relative',
      },
      onScroll: handleScroll,
      ref: containerRef as React.RefObject<HTMLElement>,
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative',
      },
    },
  };
}

/**
 * Infinite scroll hook
 */
export function useInfiniteScroll(options: {
  hasMore: boolean;
  loadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}) {
  const { hasMore, loadMore, threshold = 0.8, rootMargin = '200px' } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  
  const sentinelRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (!node || !hasMore) return;
    
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadingRef.current = true;
          loadMore();
          // Reset loading after a delay
          setTimeout(() => {
            loadingRef.current = false;
          }, 500);
        }
      },
      { threshold, rootMargin }
    );
    
    observerRef.current.observe(node);
  }, [hasMore, loadMore, threshold, rootMargin]);
  
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return { sentinelRef };
}

/**
 * Windowed data hook - only keeps visible data in memory
 */
export function useWindowedData<T>(
  fetchPage: (page: number, pageSize: number) => Promise<T[]>,
  options: {
    pageSize?: number;
    maxPagesInMemory?: number;
  } = {}
) {
  const config = bandwidthOptimizer.getConfig();
  const { 
    pageSize = config.batchSize, 
    maxPagesInMemory = 3 
  } = options;
  
  const [pages, setPages] = useState<Map<number, T[]>>(new Map());
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loadPage = useCallback(async (page: number) => {
    if (pages.has(page) || loading) return;
    
    setLoading(true);
    try {
      const data = await fetchPage(page, pageSize);
      
      setPages(prev => {
        const newPages = new Map(prev);
        newPages.set(page, data);
        
        // Remove old pages to save memory
        if (newPages.size > maxPagesInMemory) {
          const keysToRemove = Array.from(newPages.keys())
            .sort((a, b) => Math.abs(a - page) - Math.abs(b - page))
            .slice(maxPagesInMemory);
          
          keysToRemove.forEach(key => newPages.delete(key));
        }
        
        return newPages;
      });
      
      if (data.length < pageSize) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, pageSize, maxPagesInMemory, pages, loading]);
  
  // Load current page on mount/change
  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);
  
  const items = useMemo(() => {
    const result: T[] = [];
    const sortedPages = Array.from(pages.keys()).sort((a, b) => a - b);
    
    for (const pageNum of sortedPages) {
      const pageData = pages.get(pageNum);
      if (pageData) {
        result.push(...pageData);
      }
    }
    
    return result;
  }, [pages]);
  
  const loadNext = useCallback(() => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, loading]);
  
  const loadPrevious = useCallback(() => {
    if (currentPage > 0 && !loading) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, loading]);
  
  return {
    items,
    loading,
    hasMore,
    currentPage,
    loadNext,
    loadPrevious,
    loadPage,
  };
}
