/**
 * NAUTILUS CONTEXT MEMORY - Sistema de Memória de Contexto
 * Gerencia snapshots do estado do sistema para a IA
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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
      });
    }

    return {
      contextId: data.context_id,
      summary: data.summary || "",
      systemStatus: data.system_status as any,
      activeModules: data.active_modules as string[],
      recentEvents: data.recent_events as any[],
      performanceMetrics: data.performance_metrics as any
    });

  } catch (error) {
    logger.error("Error fetching context snapshot", error as Error, { contextId });
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
      logger.error("Error updating context snapshot", error as Error, { contextId: snapshot.contextId });
      throw error;
    }

  } catch (error) {
    logger.error("Error in updateContextSnapshot", error as Error, { contextId: snapshot.contextId });
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
    logger.error("Error adding recent event", error as Error, { contextId, eventType: event.type, severity: event.severity });
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
    logger.error("Error updating performance metrics", error as Error, { contextId, metrics });
  }
}
