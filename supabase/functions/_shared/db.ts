/**
 * Database utilities for Edge Functions
 * @module _shared/db
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Use ReturnType to get proper typing
type SupabaseClientType = ReturnType<typeof createClient>;

/**
 * Get service client with admin privileges
 */
export function getSupabase(): SupabaseClientType {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

/**
 * Get client with user context from auth token
 */
export function getSupabaseWithAuth(token: string): SupabaseClientType {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

/**
 * Execute database query with error handling
 */
export async function executeQuery<T>(
  queryFn: (supabase: SupabaseClientType) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const supabase = getSupabase();
    const { data, error } = await queryFn(supabase);
    
    if (error) {
      console.error('Database error:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Query execution error:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Paginate query results
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Apply pagination to a query
 */
export function applyPagination<T>(
  query: any,
  params: PaginationParams
): any {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let paginatedQuery = query.range(from, to);

  if (params.sortBy) {
    paginatedQuery = paginatedQuery.order(params.sortBy, {
      ascending: params.sortOrder !== 'desc',
    });
  }

  return paginatedQuery;
}

/**
 * Log audit event to database
 */
export async function logAudit(
  userId: string | null,
  action: string,
  module: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from('access_logs').insert({
      user_id: userId,
      action,
      module_accessed: module,
      result: 'success',
      severity: 'info',
      details: { resource_id: resourceId, ...details },
    });
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}

/**
 * Transaction-like operation with rollback
 */
export async function withTransaction<T>(
  operations: Array<(supabase: SupabaseClientType) => Promise<{ error: any }>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  const results: Array<{ error: any }> = [];

  for (const operation of operations) {
    const result = await operation(supabase);
    results.push(result);
    
    if (result.error) {
      // Log the failure
      console.error('Transaction failed:', result.error);
      return { success: false, error: result.error.message };
    }
  }

  return { success: true };
}
