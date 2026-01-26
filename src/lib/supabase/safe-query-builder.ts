/**
 * Safe Query Builder
 * Provides type-safe, RLS-aware queries with automatic multi-tenancy
 * 
 * Features:
 * - Automatic organization_id filtering
 * - Soft delete filtering (deleted_at IS NULL)
 * - Error handling
 * - Specific column selection (no SELECT *)
 */

import { supabase } from "@/integrations/supabase/client";

export interface QueryError {
  message: string;
  code?: string;
  details?: string;
}

export interface QueryResult<T> {
  data: T | null;
  error: QueryError | null;
}

export interface QueryListResult<T> {
  data: T[];
  error: QueryError | null;
  count?: number;
}

/**
 * Configuration for the SafeQueryBuilder
 */
export interface SafeQueryConfig {
  /** Organization ID for multi-tenancy filtering */
  organizationId?: string;
  /** Whether to include soft-deleted records */
  includeSoftDeleted?: boolean;
  /** Default order by column */
  orderBy?: string;
  /** Default order direction */
  orderDirection?: "asc" | "desc";
}

/**
 * Safe Query Builder Class
 * Provides type-safe database operations with automatic RLS compliance
 * 
 * Uses 'as never' casts to bypass strict Supabase typing while maintaining
 * runtime safety through RLS policies.
 */
export class SafeQueryBuilder<T> {
  private table: string;
  private config: SafeQueryConfig;

  constructor(table: string, config: SafeQueryConfig = {}) {
    this.table = table;
    this.config = {
      orderBy: "created_at",
      orderDirection: "desc",
      ...config,
    };
  }

  /**
   * Select records with automatic filtering
   * @param columns - Specific columns to select (NEVER use '*')
   */
  async select(columns: string): Promise<QueryListResult<T>> {
    try {
      let query = supabase.from(this.table as never).select(columns);

      // Apply organization filter if provided
      if (this.config.organizationId) {
        query = query.eq("organization_id" as never, this.config.organizationId);
      }

      // Apply soft delete filter
      if (!this.config.includeSoftDeleted) {
        query = query.is("deleted_at" as never, null);
      }

      // Apply ordering
      if (this.config.orderBy) {
        query = query.order(this.config.orderBy as never, {
          ascending: this.config.orderDirection === "asc",
        });
      }

      const { data, error } = await query;

      if (error) {
        return {
          data: [],
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return { data: (data as unknown as T[]) || [], error: null };
    } catch (err) {
      return {
        data: [],
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Select a single record by ID
   */
  async selectById(id: string, columns: string): Promise<QueryResult<T>> {
    try {
      let query = supabase
        .from(this.table as never)
        .select(columns)
        .eq("id" as never, id);

      // Apply soft delete filter
      if (!this.config.includeSoftDeleted) {
        query = query.is("deleted_at" as never, null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return { data: data as unknown as T | null, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Insert a new record with automatic organization_id
   */
  async insert(values: Partial<T>): Promise<QueryResult<T>> {
    try {
      const insertData = {
        ...values,
        ...(this.config.organizationId && {
          organization_id: this.config.organizationId,
        }),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(this.table as never)
        .insert(insertData as never)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return { data: data as unknown as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Update a record with validation
   */
  async update(id: string, values: Partial<T>): Promise<QueryResult<T>> {
    try {
      const updateData = {
        ...values,
        updated_at: new Date().toISOString(),
      };

      let query = supabase
        .from(this.table as never)
        .update(updateData as never)
        .eq("id" as never, id);

      // Apply organization filter if provided
      if (this.config.organizationId) {
        query = query.eq("organization_id" as never, this.config.organizationId);
      }

      // Apply soft delete filter
      if (!this.config.includeSoftDeleted) {
        query = query.is("deleted_at" as never, null);
      }

      const { data, error } = await query.select().single();

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return { data: data as unknown as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Soft delete a record
   */
  async softDelete(id: string): Promise<QueryResult<void>> {
    try {
      let query = supabase
        .from(this.table as never)
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq("id" as never, id);

      // Apply organization filter if provided
      if (this.config.organizationId) {
        query = query.eq("organization_id" as never, this.config.organizationId);
      }

      const { error } = await query;

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return { data: undefined, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Hard delete a record (use with caution)
   */
  async hardDelete(id: string): Promise<QueryResult<void>> {
    try {
      let query = supabase
        .from(this.table as never)
        .delete()
        .eq("id" as never, id);

      // Apply organization filter if provided
      if (this.config.organizationId) {
        query = query.eq("organization_id" as never, this.config.organizationId);
      }

      const { error } = await query;

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return { data: undefined, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Count records
   */
  async count(): Promise<QueryResult<number>> {
    try {
      let query = supabase
        .from(this.table as never)
        .select("*", { count: "exact", head: true });

      // Apply organization filter if provided
      if (this.config.organizationId) {
        query = query.eq("organization_id" as never, this.config.organizationId);
      }

      // Apply soft delete filter
      if (!this.config.includeSoftDeleted) {
        query = query.is("deleted_at" as never, null);
      }

      const { count, error } = await query;

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return { data: count ?? 0, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }
}

/**
 * Factory function to create a SafeQueryBuilder
 */
export function createSafeQuery<T>(
  table: string,
  config?: SafeQueryConfig
): SafeQueryBuilder<T> {
  return new SafeQueryBuilder<T>(table, config);
}

/**
 * Hook-compatible query builder factory
 */
export function useSafeQuery<T>(
  table: string,
  organizationId?: string
): SafeQueryBuilder<T> {
  return new SafeQueryBuilder<T>(table, { organizationId });
}
