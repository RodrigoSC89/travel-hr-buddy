/**
 * 🛡️ RiskSentinel Agent
 * Agente autônomo para monitoramento e mitigação de riscos
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { BaseAgent } from "./BaseAgent";
import type {
  AgentConfig,
  AgentContext,
  AgentObservation,
  AgentDecision,
  AgentAction,
} from "./types";

const RISK_SENTINEL_CONFIG: AgentConfig = {
  type: "risk",
  name: "RiskSentinel",
  description: "Agente autônomo para monitoramento, detecção e mitigação de riscos operacionais",
  capabilities: [
    "risk_detection",
    "anomaly_detection",
    "predictive_analysis",
    "auto_mitigation",
    "escalation",
  ],
  autoExecutionThreshold: 0.85,
  maxConcurrentTasks: 5,
  learningEnabled: true,
  escalationRules: [
    {
      condition: "severity >= critical",
      action: "escalate",
      targets: ["operations_manager", "safety_officer"],
      priority: 1,
    },
    {
      condition: "confidence < 0.7",
      action: "manual_review",
      targets: ["risk_analyst"],
      priority: 2,
    },
  ],
};

export class RiskSentinelAgent extends BaseAgent {
  private riskThresholds = {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    critical: 0.9,
  };

  constructor() {
    super(RISK_SENTINEL_CONFIG);
  }

  protected async gatherObservations(context: AgentContext): Promise<AgentObservation[]> {
    const observations: AgentObservation[] = [];

    try {
      // 1. Gather vessel status data
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type")
        .limit(50);

      if (vessels) {
        for (const vessel of vessels) {
          if (vessel.status === "maintenance" || vessel.status === "inactive") {
            observations.push({
              id: crypto.randomUUID(),
              type: "event",
              data: { vessel, riskType: "operational" },
              source: "vessels_table",
              timestamp: new Date(),
              priority: vessel.status === "inactive" ? 8 : 5,
            });
          }
        }
      }

      // 2. Check maintenance overdue
      const { data: maintenance } = await supabase
        .from("maintenance_records")
        .select("id, status, equipment_id, scheduled_date")
        .eq("status", "overdue")
        .limit(20);

      if (maintenance) {
        for (const record of maintenance) {
          observations.push({
            id: crypto.randomUUID(),
            type: "alert",
            data: { maintenance: record, riskType: "equipment_failure" },
            source: "maintenance_records",
            timestamp: new Date(),
            priority: 7,
          });
        }
      }

      // 3. Check compliance issues from compliance logs
      const { data: complianceLogs } = await supabase
        .from("trust_compliance_logs")
        .select("id, action, status, created_at")
        .eq("status", "pending")
        .limit(20);

      if (complianceLogs) {
        for (const log of complianceLogs) {
          observations.push({
            id: crypto.randomUUID(),
            type: "pattern",
            data: { compliance: log, riskType: "compliance" },
            source: "trust_compliance_logs",
            timestamp: new Date(),
            priority: 6,
          });
        }
      }

      // 4. Check crew status
      const { data: crew } = await supabase
        .from("crew_members")
        .select("id, first_name, last_name, status")
        .in("status", ["inactive", "medical_leave"])
        .limit(20);

      if (crew) {
        for (const member of crew) {
          observations.push({
            id: crypto.randomUUID(),
            type: "event",
            data: { crew: member, riskType: "staffing" },
            source: "crew_members",
            timestamp: new Date(),
            priority: 4,
          });
        }
      }

      logger.info(`[RiskSentinel] Gathered ${observations.length} observations`);
      return observations.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("[RiskSentinel] Failed to gather observations", { error });
      return observations;
    }
  }

  async analyze(observations: AgentObservation[]): Promise<AgentDecision[]> {
    const decisions: AgentDecision[] = [];

    // Group observations by risk type
    const byRiskType = observations.reduce((acc, obs) => {
      const riskType = String(obs.data.riskType || "unknown");
      if (!acc[riskType]) acc[riskType] = [];
      acc[riskType].push(obs);
      return acc;
    }, {} as Record<string, AgentObservation[]>);

    // Analyze each risk category
    for (const [riskType, obs] of Object.entries(byRiskType)) {
      if (obs.length === 0) continue;

      const avgPriority = obs.reduce((sum, o) => sum + o.priority, 0) / obs.length;
      const riskScore = avgPriority / 10;

      let confidence: number;
      let impact: "low" | "medium" | "high" | "critical";
      let action: string;
      let reasoning: string;

      if (riskScore >= this.riskThresholds.critical) {
        confidence = 0.95;
        impact = "critical";
        action = `AÇÃO CRÍTICA: Mitigar ${obs.length} riscos de ${riskType} imediatamente`;
        reasoning = `Detectados ${obs.length} eventos críticos de ${riskType} com score médio ${(riskScore * 100).toFixed(1)}%`;
      } else if (riskScore >= this.riskThresholds.high) {
        confidence = 0.85;
        impact = "high";
        action = `Priorizar resolução de ${obs.length} riscos de ${riskType}`;
        reasoning = `Risco elevado detectado em ${riskType}: ${obs.length} ocorrências`;
      } else if (riskScore >= this.riskThresholds.medium) {
        confidence = 0.75;
        impact = "medium";
        action = `Monitorar e planejar ações para ${obs.length} riscos de ${riskType}`;
        reasoning = `Risco moderado em ${riskType} requer atenção`;
      } else {
        confidence = 0.65;
        impact = "low";
        action = `Registrar ${obs.length} observações de ${riskType} para acompanhamento`;
        reasoning = `Baixo risco detectado, manter vigilância`;
      }

      decisions.push({
        id: crypto.randomUUID(),
        agentType: "risk",
        action,
        reasoning,
        confidence: confidence >= 0.9 ? "critical" : confidence >= 0.8 ? "high" : confidence >= 0.7 ? "medium" : "low",
        confidenceScore: confidence,
        impact,
        requiresApproval: impact === "critical" || impact === "high",
        autoExecute: confidence >= this.config.autoExecutionThreshold && impact !== "critical",
        parameters: {
          riskType,
          observationCount: obs.length,
          riskScore,
          observations: obs.map(o => o.id),
        },
        createdAt: new Date(),
      });
    }

    logger.info(`[RiskSentinel] Generated ${decisions.length} decisions`);
    return decisions;
  }

  async execute(decision: AgentDecision): Promise<AgentAction> {
    const actionId = crypto.randomUUID();

    try {
      // Execute based on impact level
      if (decision.impact === "critical" || decision.impact === "high") {
        // Create alert in system
        await supabase.from("analytics_insights").insert({
          title: `🛡️ RiskSentinel: ${decision.action}`,
          content: decision.reasoning,
          insight_type: "risk_alert",
          priority: decision.impact,
          is_actionable: true,
          confidence: decision.confidenceScore,
          data_reference: decision.parameters as unknown as import("@/integrations/supabase/types").Json,
        } as never);

        return {
          id: actionId,
          decisionId: decision.id,
          type: "alert",
          status: "completed",
          result: { alertCreated: true, impact: decision.impact },
          executedAt: new Date(),
        };
      }

      // For lower impact, just log
      return {
        id: actionId,
        decisionId: decision.id,
        type: "report",
        status: "completed",
        result: { logged: true },
        executedAt: new Date(),
      };
    } catch (error) {
      return {
        id: actionId,
        decisionId: decision.id,
        type: "alert",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async learn(action: AgentAction, outcome: "success" | "failure"): Promise<void> {
    // Adjust thresholds based on outcome
    if (outcome === "failure") {
      // Be more cautious - lower thresholds
      this.riskThresholds.high = Math.max(0.6, this.riskThresholds.high - 0.02);
      this.riskThresholds.critical = Math.max(0.8, this.riskThresholds.critical - 0.02);
    } else {
      // Slightly increase confidence in current thresholds
      this.riskThresholds.high = Math.min(0.8, this.riskThresholds.high + 0.01);
    }

    logger.info("[RiskSentinel] Learning updated thresholds", { 
      thresholds: this.riskThresholds,
      outcome 
    });
  }
}

// Singleton instance
let riskSentinelInstance: RiskSentinelAgent | null = null;

export function getRiskSentinel(): RiskSentinelAgent {
  if (!riskSentinelInstance) {
    riskSentinelInstance = new RiskSentinelAgent();
  }
  return riskSentinelInstance;
}
