/**
 * NAUTILUS CONTEXT MEMORY - Sistema de Memória de Contexto
 * Gerencia snapshots do estado do sistema para a IA
 */

import { supabase } from "@/integrations/supabase/client";

export interface SystemContextSnapshot {
  contextId: string;
  summary: string;
  systemStatus: {
    health: "operational" | "degraded" | "critical";
    uptime: number;
    timestamp: string;
  };
  activeModules: string[];
  recentEvents: Array<{
    type: string;
    message: string;
    timestamp: string;
    severity: "info" | "warning" | "error";
  }>;
  performanceMetrics: {
    avgResponseTime?: number;
    errorRate?: number;
    throughput?: number;
  };
}

/**
 * Obter snapshot de contexto atual do sistema
 */
export async function getContextSnapshot(contextId: string = "global"): Promise<SystemContextSnapshot> {
  try {
    const { data, error } = await supabase
      .from("system_context_snapshots")
      .select("*")
      .eq("context_id", contextId)
      .single();

    if (error || !data) {
      // Retornar contexto padrão se não existir
      return {
        contextId,
        summary: "Sistema operacional normal. Nenhum alerta crítico.",
        systemStatus: {
          health: "operational",
          uptime: performance.now(),
          timestamp: new Date().toISOString()
        },
        activeModules: [],
        recentEvents: [],
        performanceMetrics: {}
      };
    }

    return {
      contextId: data.context_id,
      summary: data.summary || "",
      systemStatus: data.system_status as any,
      activeModules: data.active_modules as string[],
      recentEvents: data.recent_events as any[],
      performanceMetrics: data.performance_metrics as any
    };

  } catch (error) {
    console.error("Error fetching context snapshot:", error);
    throw error;
  }
}

/**
 * Criar ou atualizar snapshot de contexto
 */
export async function updateContextSnapshot(snapshot: Partial<SystemContextSnapshot> & { contextId: string }) {
  try {
    const { error } = await supabase
      .from("system_context_snapshots")
      .upsert({
        context_id: snapshot.contextId,
        summary: snapshot.summary,
        system_status: snapshot.systemStatus,
        active_modules: snapshot.activeModules,
        recent_events: snapshot.recentEvents,
        performance_metrics: snapshot.performanceMetrics,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error updating context snapshot:", error);
      throw error;
    }

  } catch (error) {
    console.error("Error in updateContextSnapshot:", error);
    throw error;
  }
}

/**
 * Adicionar evento recente ao contexto
 */
export async function addRecentEvent(
  event: {
    type: string;
    message: string;
    severity: "info" | "warning" | "error";
  },
  contextId: string = "global"
) {
  try {
    const currentSnapshot = await getContextSnapshot(contextId);

    const recentEvents = [
      ...currentSnapshot.recentEvents,
      {
        ...event,
        timestamp: new Date().toISOString()
      }
    ].slice(-50); // Manter apenas os últimos 50 eventos

    await updateContextSnapshot({
      contextId,
      recentEvents
    });

  } catch (error) {
    console.error("Error adding recent event:", error);
  }
}

/**
 * Atualizar métricas de performance no contexto
 */
export async function updatePerformanceMetrics(
  metrics: {
    avgResponseTime?: number;
    errorRate?: number;
    throughput?: number;
  },
  contextId: string = "global"
) {
  try {
    await updateContextSnapshot({
      contextId,
      performanceMetrics: metrics
    });
  } catch (error) {
    console.error("Error updating performance metrics:", error);
  }
}
