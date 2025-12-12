// @ts-nocheck
/**
 * PATCH 135.0 - AI Self-Healing + Logs Analyzer
 * PATCH 659 - TypeScript fixes applied
 * Monitors system logs, detects anomalies, and suggests automated fixes
 * 
 * Features:
 * - Recurring failure detection
 * - Authentication error analysis
 * - Module stability monitoring
 * - Auto-fix preview system
 * - Fix history tracking
 */

import { runOpenAI } from "@/ai/engine";
import { supabase } from "@/integrations/supabase/client";
import { logsEngine } from "@/lib/monitoring/LogsEngine";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type SystemLogRow = Database['public']['Tables']['system_logs']['Row'];

export interface LogAnalysisResult {
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  overallHealth: "healthy" | "warning" | "critical";
  analyzedAt: string;
}

export interface Anomaly {
  id: string;
  type: "recurring_failure" | "auth_error" | "module_instability" | "performance_degradation";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedModule?: string;
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  pattern?: string;
}

export interface Recommendation {
  id: string;
  anomalyId: string;
  title: string;
  description: string;
  autoFixAvailable: boolean;
  autoFixScript?: string;
  manualSteps?: string[];
  confidence: number;
  estimatedImpact: "low" | "medium" | "high";
}

export interface AutoFixResult {
  success: boolean;
  anomalyId: string;
  appliedFix: string;
  result: string;
  timestamp: string;
}

/**
 * Analyze system logs for patterns and anomalies
 */
export const analyzeSystemLogs = async (
  hoursBack: number = 24
): Promise<LogAnalysisResult> => {
  try {
    // PATCH 586: Fetch logs from database (system_logs table exists)
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
    
    const { data: dbLogs, error } = await supabase
      .from("system_logs")
      .select("*")
      .gte("created_at", cutoffTime)
      .order("created_at", { ascending: false })
      .limit(1000);
    
    if (error) {
      logger.error("Error fetching system logs from database", error);
      // Fallback to in-memory logs
      const logs = logsEngine.getRecentLogs(500);
      return analyzeLogsData(logs);
    }
    
    // Combine database logs with recent in-memory logs
    const memoryLogs = logsEngine.getRecentLogs(500);
    const allLogs = [...(dbLogs || []), ...memoryLogs];
    
    return await analyzeLogsData(allLogs);
  } catch (error) {
    logger.error("Error analyzing system logs", error);
    throw error;
  }
};

/**
 * Extract log analysis logic for reusability
 */
const analyzeLogsData = async (allLogs: (SystemLogRow | any)[]): Promise<LogAnalysisResult> => {
  if (allLogs.length === 0) {
    return {
      anomalies: [],
      recommendations: [],
      overallHealth: "healthy",
      analyzedAt: new Date().toISOString()
    };
  }

  // Detect patterns
  const anomalies = detectAnomalies(allLogs);
  
  // Generate recommendations using AI
  const recommendations = await generateRecommendations(anomalies, allLogs);
  
  // Determine overall health
  const overallHealth = calculateOverallHealth(anomalies);

  return {
    anomalies,
    recommendations,
    overallHealth,
    analyzedAt: new Date().toISOString()
  };
};

/**
 * Detect anomalies in logs
 */
const detectAnomalies = (logs: (SystemLogRow | any)[]): Anomaly[] => {
  const anomalies: Anomaly[] = [];
  
  // Group logs by type and message pattern
  const errorLogs = logs.filter(log => log.level === "error" || log.severity === "error");
  const authLogs = logs.filter(log => 
    log.message?.toLowerCase().includes("auth") || 
    log.message?.toLowerCase().includes("unauthorized")
  );
  
  // Detect recurring failures
  const errorPatterns = groupByPattern(errorLogs);
  errorPatterns.forEach((group, pattern) => {
    if (group.length >= 3) {
      anomalies.push({
        id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "recurring_failure",
        severity: group.length > 10 ? "high" : "medium",
        description: `Falha recorrente detectada: ${pattern}`,
        frequency: group.length,
        firstSeen: group[group.length - 1].timestamp || group[group.length - 1].created_at,
        lastSeen: group[0].timestamp || group[0].created_at,
        pattern,
        affectedModule: extractModule(group[0])
      });
    }
  });
  
  // Detect authentication errors
  if (authLogs.length > 5) {
    anomalies.push({
      id: `anomaly-auth-${Date.now()}`,
      type: "auth_error",
      severity: authLogs.length > 20 ? "critical" : "medium",
      description: `${authLogs.length} erros de autenticação detectados`,
      frequency: authLogs.length,
      firstSeen: authLogs[authLogs.length - 1].timestamp || authLogs[authLogs.length - 1].created_at,
      lastSeen: authLogs[0].timestamp || authLogs[0].created_at
    });
  }
  
  // Detect module instability
  const moduleErrors = groupByModule(errorLogs);
  moduleErrors.forEach((errors, module) => {
    if (errors.length > 5) {
      anomalies.push({
        id: `anomaly-module-${module}-${Date.now()}`,
        type: "module_instability",
        severity: errors.length > 15 ? "high" : "medium",
        description: `Módulo ${module} apresenta instabilidade`,
        affectedModule: module,
        frequency: errors.length,
        firstSeen: errors[errors.length - 1].timestamp || errors[errors.length - 1].created_at,
        lastSeen: errors[0].timestamp || errors[0].created_at
      });
    }
  });
  
  return anomalies;
};

/**
 * Generate AI-powered recommendations
 */
const generateRecommendations = async (
  anomalies: Anomaly[],
  logs: (SystemLogRow | any)[]
): Promise<Recommendation[]> => {
  if (anomalies.length === 0) {
    return [];
  }

  try {
    const anomalyDescriptions = anomalies.map((a, idx) => 
      `${idx + 1}. [${a.severity.toUpperCase()}] ${a.type}: ${a.description} (${a.frequency}x)`
    ).join("\n");

    const recentErrors = logs
      .filter(log => log.level === "error")
      .slice(0, 10)
      .map(log => `- ${log.message || log.error}`)
      .join("\n");

    const prompt = `Analise as seguintes anomalias detectadas no sistema e forneça recomendações práticas:

ANOMALIAS DETECTADAS:
${anomalyDescriptions}

ERROS RECENTES:
${recentErrors}

Para cada anomalia, forneça recomendações no formato JSON:
{
  "recommendations": [
    {
      "anomalyId": "id da anomalia",
      "title": "título curto da recomendação",
      "description": "descrição detalhada",
      "autoFixAvailable": true/false,
      "autoFixScript": "código de correção se aplicável (apenas se autoFixAvailable=true)",
      "manualSteps": ["passo 1", "passo 2"],
      "confidence": 0.0 a 1.0,
      "estimatedImpact": "low" | "medium" | "high"
    }
  ]
}

Regras:
- autoFixAvailable apenas para correções simples e seguras
- autoFixScript deve ser JavaScript válido e seguro
- manualSteps para ações que requerem intervenção humana
- confidence alto (>0.8) apenas para soluções bem estabelecidas`;

    const response = await runOpenAI({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em diagnóstico e correção de sistemas. Sempre retorne JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      maxTokens: 2000
    });

    return parseRecommendationsResponse(response.content, anomalies);
  } catch (error) {
    logger.error("Error generating recommendations", error);
    // Return fallback recommendations
    return generateFallbackRecommendations(anomalies);
  }
};

/**
 * Parse AI recommendations response
 */
const parseRecommendationsResponse = (
  responseText: string,
  anomalies: Anomaly[]
): Recommendation[] => {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return (parsed.recommendations || []).map((rec: any) => ({
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      anomalyId: rec.anomalyId,
      title: rec.title,
      description: rec.description,
      autoFixAvailable: rec.autoFixAvailable === true,
      autoFixScript: rec.autoFixScript,
      manualSteps: Array.isArray(rec.manualSteps) ? rec.manualSteps : [],
      confidence: typeof rec.confidence === "number" ? rec.confidence : 0.6,
      estimatedImpact: ["low", "medium", "high"].includes(rec.estimatedImpact) 
        ? rec.estimatedImpact 
        : "medium"
    }));
  } catch (error) {
    logger.error("Error parsing recommendations", error);
    return [];
  }
};

/**
 * Generate fallback recommendations
 */
const generateFallbackRecommendations = (anomalies: Anomaly[]): Recommendation[] => {
  return anomalies.map(anomaly => ({
    id: `rec-fallback-${anomaly.id}`,
    anomalyId: anomaly.id,
    title: `Investigar ${anomaly.type}`,
    description: `Requer análise manual: ${anomaly.description}`,
    autoFixAvailable: false,
    manualSteps: [
      "Revisar logs detalhados",
      "Identificar causa raiz",
      "Implementar correção apropriada",
      "Monitorar após correção"
    ],
    confidence: 0.5,
    estimatedImpact: anomaly.severity === "critical" || anomaly.severity === "high" ? "high" : "medium"
  }));
};

/**
 * Apply auto-fix (preview mode)
 */
export const previewAutoFix = async (
  recommendationId: string,
  recommendation: Recommendation
): Promise<string> => {
  if (!recommendation.autoFixAvailable || !recommendation.autoFixScript) {
    return "Auto-fix não disponível para esta recomendação";
  }

  return `PREVIEW MODE - Auto-fix Script:

${recommendation.autoFixScript}

⚠️ Esta correção será aplicada quando confirmada.
Impacto estimado: ${recommendation.estimatedImpact}
Confiança: ${(recommendation.confidence * 100).toFixed(0)}%`;
};

/**
 * Store auto-fix in history (adapted to use existing table structure)
 */
export const storeAutoFixHistory = async (
  result: AutoFixResult
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("autofix_history")
      .insert({
        file_path: "system", // Generic since we don't have specific file
        issue_type: "anomaly",
        fix_applied: result.appliedFix,
        status: result.success ? "success" : "failed",
        details: {
          anomaly_id: result.anomalyId,
          result: result.result,
          timestamp: result.timestamp
        },
        applied_at: result.timestamp
      });
    
    if (error) {
      logger.error("Error storing autofix history", error);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error("Error storing autofix history", error);
    return false;
  }
};

// Helper functions

const groupByPattern = (logs: (SystemLogRow | any)[]): Map<string, any[]> => {
  const patterns = new Map<string, any[]>();
  
  logs.forEach(log => {
    const message = log.message || log.error || "";
    // Simple pattern extraction (first 50 chars)
    const pattern = message.substring(0, 50).trim();
    
    if (!patterns.has(pattern)) {
      patterns.set(pattern, []);
    }
    patterns.get(pattern)!.push(log);
  });
  
  return patterns;
};

const groupByModule = (logs: (SystemLogRow | any)[]): Map<string, any[]> => {
  const modules = new Map<string, any[]>();
  
  logs.forEach(log => {
    const module = extractModule(log);
    
    if (!modules.has(module)) {
      modules.set(module, []);
    }
    modules.get(module)!.push(log);
  });
  
  return modules;
};

const extractModule = (log: any): string => {
  return log.module || log.component || log.source || "unknown";
};

const calculateOverallHealth = (anomalies: Anomaly[]): "healthy" | "warning" | "critical" => {
  if (anomalies.length === 0) return "healthy";
  
  const hasCritical = anomalies.some(a => a.severity === "critical");
  const hasMultipleHigh = anomalies.filter(a => a.severity === "high").length > 2;
  
  if (hasCritical || hasMultipleHigh) return "critical";
  if (anomalies.some(a => a.severity === "high")) return "warning";
  
  return anomalies.length > 5 ? "warning" : "healthy";
};
