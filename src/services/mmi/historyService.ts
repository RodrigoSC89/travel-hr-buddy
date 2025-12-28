/**
 * MMI History Service
 * Service layer for MMI maintenance history operations
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Local type definition for MMI History (independent of Supabase types)
export interface MMIHistory {
  id: string;
  vessel_id?: string | null;
  task_description: string;
  system_name?: string | null;
  component_name?: string | null;
  status?: "pendente" | "executado" | "atrasado" | "cancelado" | null;
  priority?: "low" | "medium" | "high" | "critical" | null;
  scheduled_date?: string | null;
  completed_date?: string | null;
  technician_id?: string | null;
  ai_recommendation?: string | null;
  maintenance_type?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  vessel?: { id: string; name: string } | null;
}

export interface MMIHistoryFilters {
  status?: "executado" | "pendente" | "atrasado";
  vesselId?: string;
}

export interface MMIHistoryStats {
  total: number;
  executado: number;
  pendente: number;
  atrasado: number;
}

/**
 * Fetch MMI history records with optional filtering
 */
export async function fetchMMIHistory(filters?: MMIHistoryFilters): Promise<MMIHistory[]> {
  let query = supabase
    .from("mmi_history")
    .select(`
      *,
      vessel:vessels(id, name)
    `)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.vesselId) {
    query = query.eq("vessel_id", filters.vesselId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("Error fetching MMI history", error as Error, { filters });
    throw new Error(`Failed to fetch MMI history: ${error.message}`);
  }

  return (data as unknown as MMIHistory[]) || [];
}

/**
 * Get aggregated statistics for MMI history
 */
export async function getMMIHistoryStats(): Promise<MMIHistoryStats> {
  const { data, error } = await supabase
    .from("mmi_history")
    .select("status");

  if (error) {
    logger.error("Error fetching MMI history stats", error as Error);
    throw new Error(`Failed to fetch MMI history stats: ${error.message}`);
  }

  const stats: MMIHistoryStats = {
    total: data?.length || 0,
    executado: 0,
    pendente: 0,
    atrasado: 0,
  };

  data?.forEach((record) => {
    if (record.status === "executado") stats.executado++;
    else if (record.status === "pendente") stats.pendente++;
    else if (record.status === "atrasado") stats.atrasado++;
  });

  return stats;
}

/**
 * Create a new MMI history record
 */
export async function createMMIHistory(
  history: Omit<MMIHistory, "id" | "created_at" | "updated_at">
): Promise<MMIHistory> {
  const { data, error } = await supabase
    .from("mmi_history")
    .insert(history)
    .select(`
      *,
      vessel:vessels(id, name)
    `)
    .single();

  if (error) {
    logger.error("Error creating MMI history", error as Error, { vesselId: history.vessel_id, taskDescription: history.task_description });
    throw new Error(`Failed to create MMI history: ${error.message}`);
  }

  return data as unknown as MMIHistory;
}

/**
 * Update an existing MMI history record
 */
export async function updateMMIHistory(
  id: string,
  updates: Partial<Omit<MMIHistory, "id" | "created_at" | "updated_at">>
): Promise<MMIHistory> {
  const { data, error } = await supabase
    .from("mmi_history")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      vessel:vessels(id, name)
    `)
    .single();

  if (error) {
    logger.error("Error updating MMI history", error as Error, { id, updates: Object.keys(updates) });
    throw new Error(`Failed to update MMI history: ${error.message}`);
  }

  return data as unknown as MMIHistory;
}

/**
 * Delete an MMI history record
 */
export async function deleteMMIHistory(id: string): Promise<void> {
  const { error } = await supabase
    .from("mmi_history")
    .delete()
    .eq("id", id);

  if (error) {
    logger.error("Error deleting MMI history", error as Error, { id });
    throw new Error(`Failed to delete MMI history: ${error.message}`);
  }
}
