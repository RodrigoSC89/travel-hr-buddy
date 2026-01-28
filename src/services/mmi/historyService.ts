/**
 * PATCH 877 - MMI History Service
 * PATCH 900 - Removed @ts-nocheck, using proper typing
 */

import { supabase } from "@/integrations/supabase/client";
import type { MMIHistory } from "@/types/mmi";
import { logger } from "@/lib/logger";

export interface MMIHistoryFilters {
  status?: "executado" | "pendente" | "atrasado";
  systemName?: string;
  vesselId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MMIHistoryStats {
  total: number;
  executado: number;
  pendente: number;
  atrasado: number;
}

// Type-safe query result with vessel join
interface MMIHistoryRow {
  id: string;
  vessel_id: string | null;
  system_name: string | null;
  task_description: string | null;
  status: string | null;
  executed_at: string | null;
  pdf_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  vessel?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Map database row to MMIHistory type
 */
function mapRowToHistory(row: MMIHistoryRow): MMIHistory {
  return {
    id: row.id,
    vessel_id: row.vessel_id ?? undefined,
    system_name: row.system_name ?? "",
    task_description: row.task_description ?? "",
    status: (row.status as MMIHistory["status"]) ?? "pendente",
    executed_at: row.executed_at ?? undefined,
    pdf_url: row.pdf_url ?? undefined,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
    vessel: row.vessel ?? undefined
  };
}

/**
 * Fetch MMI history with optional filters
 */
export async function fetchMMIHistory(
  filters: MMIHistoryFilters = {}
): Promise<MMIHistory[]> {
  try {
    let query = supabase
      .from("mmi_history")
      .select("*, vessel:vessels(id, name)")
      .order("executed_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.systemName) {
      query = query.eq("system_name", filters.systemName);
    }
    if (filters.vesselId) {
      query = query.eq("vessel_id", filters.vesselId);
    }
    if (filters.startDate) {
      query = query.gte("executed_at", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("executed_at", filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      logger.error("[MMIHistory] Error fetching history", error);
      throw new Error(`Failed to fetch MMI history: ${error.message}`);
    }

    return (data || []).map((row) => mapRowToHistory(row as unknown as MMIHistoryRow));
  } catch (error) {
    logger.error("[MMIHistory] Unexpected error in fetchMMIHistory", error as Error);
    throw error;
  }
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
  const insertData = {
    vessel_id: history.vessel_id,
    system_name: history.system_name,
    task_description: history.task_description,
    status: history.status,
    executed_at: history.executed_at,
    pdf_url: history.pdf_url
  };

  const { data, error } = await supabase
    .from("mmi_history")
    .insert(insertData)
    .select(`
      *,
      vessel:vessels(id, name)
    `)
    .single();

  if (error) {
    logger.error("Error creating MMI history", error as Error, { 
      vesselId: history.vessel_id, 
      taskDescription: history.task_description 
    });
    throw new Error(`Failed to create MMI history: ${error.message}`);
  }

  return mapRowToHistory(data as unknown as MMIHistoryRow);
}

/**
 * Update an existing MMI history record
 */
export async function updateMMIHistory(
  id: string,
  updates: Partial<Omit<MMIHistory, "id" | "created_at" | "updated_at">>
): Promise<MMIHistory> {
  const updateData: Record<string, unknown> = {};
  
  if (updates.vessel_id !== undefined) updateData.vessel_id = updates.vessel_id;
  if (updates.system_name !== undefined) updateData.system_name = updates.system_name;
  if (updates.task_description !== undefined) updateData.task_description = updates.task_description;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.executed_at !== undefined) updateData.executed_at = updates.executed_at;
  if (updates.pdf_url !== undefined) updateData.pdf_url = updates.pdf_url;

  const { data, error } = await supabase
    .from("mmi_history")
    .update(updateData)
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

  return mapRowToHistory(data as unknown as MMIHistoryRow);
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
