/**
 * Query Optimizer for Supabase
 * Optimizes database queries for low-bandwidth scenarios
 */

import { supabase } from "@/integrations/supabase/client";

interface QueryOptions {
  /** Fields to select (reduces payload) */
  select?: string;
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Order by field */
  orderBy?: string;
  /** Order direction */
  orderDirection?: "asc" | "desc";
  /** Cache time in milliseconds */
  cacheTime?: number;
}

interface CachedQuery {
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

// In-memory query cache
const queryCache = new Map<string, CachedQuery>();

/**
 * Generate cache key from query parameters
 */
function generateCacheKey(table: string, options: QueryOptions, filters?: Record<string, unknown>): string {
  return JSON.stringify({ table, options, filters });
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cached: CachedQuery): boolean {
  return Date.now() < cached.expiresAt;
}

/**
 * Optimized query with caching and pagination
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic table query requires generic default
export async function optimizedQuery<T = Record<string, unknown>>(
  table: string,
  options: QueryOptions = {},
  filters?: Record<string, unknown>
): Promise<{ data: T[]; count: number; fromCache: boolean }> {
  const {
    select = "*",
    page = 1,
    pageSize = 20,
    orderBy = "created_at",
    orderDirection = "desc",
    cacheTime = 30000, // 30 seconds default
  } = options;

  const cacheKey = generateCacheKey(table, options, filters);
  
  // Check cache first
  const cached = queryCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return { ...(cached.data as Record<string, unknown>), fromCache: true } as { data: T[]; count: number; fromCache: boolean };
  }

  // Calculate pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build query - using type assertion since table names are dynamic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic table name requires runtime assertion
  let query = (supabase.from as Function)(table)
    .select(select, { count: "exact" })
    .range(from, to)
    .order(orderBy, { ascending: orderDirection === "asc" });

  // Apply filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === "object" && value !== null && 'operator' in value) {
          const filterVal = value as { operator: string; value: unknown };
          switch (filterVal.operator) {
            case "gte":
              query = query.gte(key, filterVal.value);
              break;
            case "lte":
              query = query.lte(key, filterVal.value);
              break;
            case "like":
              query = query.ilike(key, `%${filterVal.value}%`);
              break;
            case "is":
              query = query.is(key, filterVal.value);
              break;
          }
        } else {
          query = query.eq(key, value);
        }
      }
    });
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  const result = { data: data || [], count: count || 0 };

  // Cache the result
  queryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
    expiresAt: Date.now() + cacheTime,
  });

  return { ...result, fromCache: false };
}

/**
 * Batch multiple queries for efficiency
 */
export async function batchQueries<T extends Record<string, unknown>>(
  queries: Array<{
    key: string;
    table: string;
    options?: QueryOptions;
    filters?: Record<string, unknown>;
  }>
): Promise<T> {
  const results = await Promise.all(
    queries.map(async ({ key, table, options, filters }) => {
      const result = await optimizedQuery(table, options, filters);
      return { key, result };
    })
  );

  return results.reduce((acc, { key, result }) => {
    (acc as Record<string, unknown>)[key] = result;
    return acc;
  }, {} as T);
}

/**
 * Invalidate cache for a specific table or query
 */
export function invalidateCache(table?: string): void {
  if (table) {
    // Invalidate all queries for this table
    for (const key of queryCache.keys()) {
      if (key.includes(`"table":"${table}"`)) {
        queryCache.delete(key);
      }
    }
  } else {
    // Clear entire cache
    queryCache.clear();
  }
}

/**
 * Prefetch data for anticipated navigation
 */
export function prefetchQuery(
  table: string,
  options?: QueryOptions,
  filters?: Record<string, unknown>
): void {
  // Only prefetch on fast connections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Navigator Network Information API not in standard types
  const connection = (navigator as unknown as Record<string, unknown>).connection as { effectiveType?: string; saveData?: boolean } | undefined;
  if (connection?.effectiveType === "4g" && !connection?.saveData) {
    optimizedQuery(table, options, filters).catch(() => {
      // Silently fail prefetch
    });
  }
}

/**
 * Get minimal fields for list views
 */
export const minimalFields = {
  vessels: "id,name,imo_number,status,vessel_type",
  crew_members: "id,full_name,rank,status,vessel_id",
  maintenance_tasks: "id,title,status,priority,due_date",
  inventory_items: "id,name,quantity,min_quantity,unit",
  documents: "id,title,document_type,status,expiry_date",
  inspections: "id,inspection_type,status,scheduled_date",
} as const;

/**
 * Adaptive page size based on connection
 */
export function getAdaptivePageSize(): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Navigator Network Information API not in standard types
  const connection = (navigator as unknown as Record<string, unknown>).connection as { effectiveType?: string; saveData?: boolean } | undefined;
  
  if (!connection) return 20;
  
  if (connection.saveData) return 10;
  
  switch (connection.effectiveType) {
    case "slow-2g":
    case "2g":
      return 5;
    case "3g":
      return 15;
    case "4g":
    default:
      return 25;
  }
}
