/**
 * Resolved Work Orders Service
 * Manages resolved work orders (OS) for AI learning
 * Type-safe with explicit Supabase casting
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

export interface MmiOsResolvidasRow {
  id: string;
  job_id: string | null;
  titulo: string;
  descricao: string | null;
  componente_id: string | null;
  componente_nome: string | null;
  acao_tomada: string;
  resultado: string | null;
  tempo_resolucao_horas: number | null;
  custo_estimado: number | null;
  tecnico_responsavel: string | null;
  resolvido_em: string | null;
  resolvido_por: string | null;
  tags: string[] | null;
  criticidade: string | null;
  origem: string | null;
  metadata: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateResolvedWorkOrderInput {
  job_id?: string;
  titulo: string;
  descricao?: string;
  componente_id?: string;
  componente_nome?: string;
  acao_tomada: string;
  resultado?: string;
  tempo_resolucao_horas?: number;
  custo_estimado?: number;
  tecnico_responsavel?: string;
  tags?: string[];
  criticidade?: string;
  origem?: string;
  metadata?: Json;
}

/**
 * Create a new resolved work order record
 */
export const createResolvedWorkOrder = async (
  data: CreateResolvedWorkOrderInput
): Promise<{ data: MmiOsResolvidasRow | null; error: Error | null }> => {
  try {
    // Cast input to match Supabase Insert type
    const insertData: Database["public"]["Tables"]["mmi_os_resolvidas"]["Insert"] = {
      titulo: data.titulo,
      acao_tomada: data.acao_tomada,
      job_id: data.job_id ?? null,
      descricao: data.descricao ?? null,
      componente_id: data.componente_id ?? null,
      componente_nome: data.componente_nome ?? null,
      resultado: data.resultado ?? null,
      tempo_resolucao_horas: data.tempo_resolucao_horas ?? null,
      custo_estimado: data.custo_estimado ?? null,
      tecnico_responsavel: data.tecnico_responsavel ?? null,
      tags: data.tags ?? null,
      criticidade: data.criticidade ?? null,
      origem: data.origem ?? null,
      metadata: data.metadata ?? null,
    };

    const { data: result, error } = await supabase
      .from("mmi_os_resolvidas")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logger.error("Error creating resolved work order", error as Error, { titulo: data.titulo });
      return { data: null, error };
    }

    return { data: result, error: null };
  } catch (error) {
    logger.error("Unexpected error", error as Error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get all resolved work orders for a specific component
 */
export const getResolvedWorkOrdersByComponent = async (
  componente: string,
  onlySuccessful: boolean = false
): Promise<{ data: MmiOsResolvidasRow[] | null; error: Error | null }> => {
  try {
    let query = supabase
      .from("mmi_os_resolvidas")
      .select("*")
      .eq("componente_nome", componente)
      .order("resolvido_em", { ascending: false });

    if (onlySuccessful) {
      query = query.eq("resultado", "Sucesso");
    }

    const { data, error } = await query;

    if (error) {
      logger.error("Error fetching resolved work orders", error as Error, { componente, onlySuccessful });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error("Unexpected error", error as Error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get statistics for resolved work orders
 */
export const getResolvedWorkOrderStats = async (componente?: string) => {
  try {
    let query = supabase
      .from("mmi_os_resolvidas")
      .select("*");

    if (componente) {
      query = query.eq("componente_nome", componente);
    }

    const { data, error } = await query;

    if (error) {
      logger.error("Error fetching statistics", error as Error, { componente });
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: new Error("No data found") };
    }

    // Calculate statistics
    const total = data.length;
    const successful = data.filter(item => item.resultado === "Sucesso").length;
    const failed = data.filter(item => item.resultado === "Falha").length;
    const pending = data.filter(item => !item.resultado).length;
    
    // Calculate average resolution time
    const itemsWithTime = data.filter(item => item.tempo_resolucao_horas);
    const avgResolutionHours = itemsWithTime.length > 0
      ? itemsWithTime.reduce((sum, item) => sum + (item.tempo_resolucao_horas || 0), 0) / itemsWithTime.length
      : 0;

    return {
      data: {
        total,
        successful,
        failed,
        pending,
        successRate: total > 0 ? (successful / total) * 100 : 0,
        avgResolutionHours,
      },
      error: null,
    };
  } catch (error) {
    logger.error("Unexpected error", error as Error);
    return { data: null, error: error as Error };
  }
};

/**
 * Update the result status of a resolved work order
 */
export const updateWorkOrderResult = async (
  id: string,
  resultado: string,
  tecnico_responsavel?: string
): Promise<{ data: MmiOsResolvidasRow | null; error: Error | null }> => {
  try {
    const updateData: { resultado: string; tecnico_responsavel?: string } = {
      resultado,
    };

    if (tecnico_responsavel) {
      updateData.tecnico_responsavel = tecnico_responsavel;
    }

    const { data, error } = await supabase
      .from("mmi_os_resolvidas")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating work order result", error as Error, { id, resultado });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error("Unexpected error", error as Error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get the most common actions for a specific component
 */
export const getMostCommonActions = async (
  componente: string,
  limit: number = 5
): Promise<{ data: Array<{ acao: string; count: number }> | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from("mmi_os_resolvidas")
      .select("acao_tomada")
      .eq("componente_nome", componente);

    if (error) {
      logger.error("Error fetching actions", error as Error, { componente, limit });
      return { data: null, error };
    }

    if (!data) {
      return { data: [], error: null };
    }

    // Count occurrences of each action
    const actionCounts: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.acao_tomada) {
        actionCounts[item.acao_tomada] = (actionCounts[item.acao_tomada] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const sortedActions = Object.entries(actionCounts)
      .map(([acao, count]) => ({ acao, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { data: sortedActions, error: null };
  } catch (error) {
    logger.error("Unexpected error", error as Error);
    return { data: null, error: error as Error };
  }
};

/**
 * Search resolved work orders by text
 */
export const searchResolvedWorkOrders = async (
  searchTerm: string,
  limit: number = 20
): Promise<{ data: MmiOsResolvidasRow[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from("mmi_os_resolvidas")
      .select("*")
      .or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,acao_tomada.ilike.%${searchTerm}%`)
      .order("resolvido_em", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error searching work orders", error as Error, { searchTerm });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error("Unexpected error", error as Error);
    return { data: null, error: error as Error };
  }
};
