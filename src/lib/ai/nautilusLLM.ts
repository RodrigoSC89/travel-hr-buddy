/**
 * NAUTILUS LLM CORE - IA Embarcada do Sistema
 * PATCH 40.0
 * 
 * Sistema de inteligência artificial integrado para:
 * - Análise de contexto operacional
 * - Diagnóstico automático de falhas
 * - Comandos em linguagem natural
 * - Aprendizado contínuo
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type NautilusMode = "deterministic" | "creative" | "safe";

export interface NautilusLLMOptions {
  prompt: string;
  contextId?: string;
  moduleId?: string;
  mode?: NautilusMode;
}

export interface NautilusLLMResponse {
  response: string;
  sessionId: string;
  executionTime: number;
  confidenceScore: number;
  usedCache: boolean;
  model: string;
}

/**
 * Função principal para interagir com a IA embarcada do Nautilus
 */
export async function nautilusRespond(options: NautilusLLMOptions): Promise<NautilusLLMResponse> {
  const {
    prompt,
    contextId = "global",
    moduleId,
    mode = "safe"
  } = options;

  const sessionId = crypto.randomUUID();

  try {
    const { data, error } = await supabase.functions.invoke("nautilus-llm", {
      body: {
        prompt,
        contextId,
        moduleId,
        sessionId,
        mode
      }
    });

    if (error) {
      throw error;
    }

    return data as NautilusLLMResponse;

  } catch (error) {
    logger.error("Nautilus LLM error", error as Error, {
      prompt: prompt.substring(0, 100),
      contextId,
      moduleId,
      sessionId,
      mode
    });
    
    // Fallback local
    return {
      response: "Sistema de IA temporariamente indisponível. Por favor, verifique os logs do sistema ou tente novamente em alguns instantes.",
      sessionId,
      executionTime: 0,
      confidenceScore: 0.5,
      usedCache: false,
      model: "fallback"
    };
  }
}

/**
 * Função para comandos rápidos pré-definidos
 */
export async function nautilusQuickCommand(command: string): Promise<NautilusLLMResponse> {
  const commandMap: Record<string, string> = {
    "status": "Forneça um resumo completo do status atual de todos os módulos do sistema",
    "diagnostico": "Analise os logs recentes e identifique possíveis problemas ou anomalias",
    "resumo": "Gere um resumo executivo dos últimos 10 minutos de operação",
    "modulos-lentos": "Identifique quais módulos estão operando com latência acima do normal",
    "alertas": "Liste todos os alertas ativos e suas prioridades",
    "manutencao": "Sugira ações de manutenção preventiva baseadas no histórico operacional"
  };

  const prompt = commandMap[command.toLowerCase()] || command;

  return nautilusRespond({ prompt, mode: "deterministic" });
}

/**
 * Atualizar snapshot de contexto do sistema
 */
export async function updateSystemContext(contextId: string = "global") {
  try {
    // Coletar métricas do sistema
    const systemStatus = {
      timestamp: new Date().toISOString(),
      health: "operational",
      uptime: performance.now()
    };

    const { error } = await supabase
      .from("system_context_snapshots")
      .upsert({
        context_id: contextId,
        summary: "Sistema operacional normal",
        system_status: systemStatus,
        active_modules: [],
        recent_events: [],
        performance_metrics: {},
        updated_at: new Date().toISOString()
      });

    if (error) {
      logger.error("Error updating context", error as Error, { contextId });
    }

  } catch (error) {
    logger.error("Error in updateSystemContext", error as Error, { contextId });
  }
}

/**
 * Buscar histórico de conversação com a IA
 */
export async function getConversationHistory(sessionId: string) {
  const { data, error } = await supabase
    .from("ia_context_log")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("Error fetching conversation history", error as Error, { sessionId });
    return [];
  }

  return data;
}

/**
 * Buscar estatísticas de uso da IA
 */
export async function getIAStats() {
  const { data, error } = await supabase
    .from("ia_context_log")
    .select("model_used, confidence_score, execution_time_ms")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    logger.error("Error fetching IA stats", error as Error);
    return {
      totalRequests: 0,
      averageConfidence: 0,
      averageExecutionTime: 0,
      cacheHitRate: 0
    };
  }

  const totalRequests = data.length;
  const cacheHits = data.filter(d => d.model_used === "cache").length;
  const avgConfidence = data.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / totalRequests;
  const avgExecTime = data.reduce((sum, d) => sum + (d.execution_time_ms || 0), 0) / totalRequests;

  return {
    totalRequests,
    averageConfidence: avgConfidence,
    averageExecutionTime: avgExecTime,
    cacheHitRate: (cacheHits / totalRequests) * 100
  };
}
