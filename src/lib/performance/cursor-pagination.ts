/**
 * Cursor-based Pagination
 * More efficient than offset pagination for large datasets
 */

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  direction: "forward" | "backward";
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  totalEstimate?: number;
}

/**
 * Encode cursor from record
 */
export function encodeCursor(record: { id: string; created_at?: string }): string {
  const payload = {
    id: record.id,
    ts: record.created_at || new Date().toISOString(),
  };
  return btoa(JSON.stringify(payload));
}

/**
 * Decode cursor to get pagination position
 */
export function decodeCursor(cursor: string): { id: string; ts: string } | null {
  try {
    return JSON.parse(atob(cursor));
  } catch {
    return null;
  }
}

/**
 * Build Supabase query with cursor pagination
 */
export function buildCursorQuery<T extends { id: string; created_at?: string }>(
  baseQuery: any,
  params: CursorPaginationParams
): any {
  let query = baseQuery;

  if (params.cursor) {
    const decoded = decodeCursor(params.cursor);
    if (decoded) {
      if (params.direction === "forward") {
        query = query
          .or(`created_at.lt.${decoded.ts},and(created_at.eq.${decoded.ts},id.lt.${decoded.id})`)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false });
      } else {
        query = query
          .or(`created_at.gt.${decoded.ts},and(created_at.eq.${decoded.ts},id.gt.${decoded.id})`)
          .order("created_at", { ascending: true })
          .order("id", { ascending: true });
      }
    }
  } else {
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  }

  // Fetch one extra to check if there's more
  return query.limit(params.limit + 1);
}

/**
 * Process query results into pagination result
 */
export function processCursorResults<T extends { id: string; created_at?: string }>(
  data: T[],
  params: CursorPaginationParams
): CursorPaginationResult<T> {
  const hasMore = data.length > params.limit;
  const items = hasMore ? data.slice(0, params.limit) : data;

  // Reverse if we fetched backward
  if (params.direction === "backward") {
    items.reverse();
  }

  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  return {
    data: items,
    nextCursor: lastItem ? encodeCursor(lastItem) : null,
    prevCursor: firstItem ? encodeCursor(firstItem) : null,
    hasMore,
  };
}

/**
 * Hook for cursor pagination state management
 */
import { useState, useCallback } from "react";

export function useCursorPagination<T extends { id: string; created_at?: string }>(
  fetchFn: (params: CursorPaginationParams) => Promise<CursorPaginationResult<T>>,
  initialLimit = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [cursors, setCursors] = useState<{ next: string | null; prev: string | null }>({
    next: null,
    prev: null,
  });
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(async (cursor?: string, direction: "forward" | "backward" = "forward") => {
    setIsLoading(true);
    try {
      const result = await fetchFn({ cursor, limit: initialLimit, direction });
      
      if (direction === "forward" && cursor) {
        // Append for infinite scroll
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      
      setCursors({ next: result.nextCursor, prev: result.prevCursor });
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, initialLimit]);

  const loadMore = useCallback(() => {
    if (cursors.next && !isLoading) {
      fetchPage(cursors.next, "forward");
    }
  }, [cursors.next, isLoading, fetchPage]);

  const refresh = useCallback(() => {
    setData([]);
    setCursors({ next: null, prev: null });
    fetchPage();
  }, [fetchPage]);

  return {
    data,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    fetchPage,
  };
}
