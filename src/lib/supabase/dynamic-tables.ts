/**
 * Dynamic Table Access for tables not in generated Supabase types
 * Provides type-safe access to custom tables like api_routes
 */

import { supabase } from "@/integrations/supabase/client";
import type { ApiRoute, ApiRouteInsert } from "@/types/supabase-aliases";

/**
 * Type-safe accessor for the api_routes table
 * This table exists in migrations but not in generated types
 */
export const apiRoutesTable = {
  async select(columns = "*") {
    const { data, error } = await supabase
      .from("api_routes" as "organizations") // Type bypass for dynamic table
      .select(columns);
    
    return { data: data as ApiRoute[] | null, error };
  },

  async selectOne(id: string) {
    const { data, error } = await supabase
      .from("api_routes" as "organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as ApiRoute | null, error };
  },

  async insert(values: ApiRouteInsert | ApiRouteInsert[]) {
    const { data, error } = await supabase
      .from("api_routes" as "organizations")
      .insert(values as never)
      .select();
    
    return { data: data as ApiRoute[] | null, error };
  },

  async update(id: string, values: Partial<ApiRouteInsert>) {
    const { data, error } = await supabase
      .from("api_routes" as "organizations")
      .update(values as never)
      .eq("id", id)
      .select();
    
    return { data: data as ApiRoute[] | null, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("api_routes" as "organizations")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  /**
   * Subscribe to realtime changes on api_routes
   */
  subscribe(callback: (payload: { eventType: string; new: ApiRoute | null; old: ApiRoute | null }) => void) {
    return supabase
      .channel("api_routes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "api_routes" },
        (payload) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as ApiRoute | null,
            old: payload.old as ApiRoute | null,
          });
        }
      )
      .subscribe();
  },
};

/**
 * Generic dynamic table accessor for other custom tables
 * @param tableName - The name of the table to access
 */
export function dynamicFrom<T>(tableName: string) {
  return {
    async select(columns = "*") {
      const { data, error } = await supabase
        .from(tableName as "organizations")
        .select(columns);
      return { data: data as T[] | null, error };
    },

    async insert(values: Partial<T> | Partial<T>[]) {
      const { data, error } = await supabase
        .from(tableName as "organizations")
        .insert(values as never)
        .select();
      return { data: data as T[] | null, error };
    },

    async update(id: string, values: Partial<T>) {
      const { data, error } = await supabase
        .from(tableName as "organizations")
        .update(values as never)
        .eq("id", id)
        .select();
      return { data: data as T[] | null, error };
    },

    async delete(id: string) {
      const { error } = await supabase
        .from(tableName as "organizations")
        .delete()
        .eq("id", id);
      return { error };
    },
  };
}
