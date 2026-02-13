/**
 * 📋 AuditBot Agent
 * Agente autônomo para auditoria automatizada e compliance
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

const AUDITBOT_CONFIG: AgentConfig = {
  type: "audit",
  name: "AuditBot",
  description: "Agente autônomo para auditoria automatizada e verificação de compliance",
  capabilities: [
    "compliance_checking",
    "anomaly_detection",
    "regulatory_monitoring",
    "document_verification",
    "audit_report_generation",
  ],
  autoExecutionThreshold: 0.75,
  maxConcurrentTasks: 4,
  learningEnabled: true,
  escalationRules: [
    {
      condition: "critical_violation",
      action: "escalate",
      targets: ["compliance_officer", "legal_team"],
      priority: 1,
    },
    {
      condition: "repeated_issue",
      action: "notify",
      targets: ["department_head"],
      priority: 2,
    },
  ],
};

interface AuditFinding {
  id: string;
  type: "violation" | "warning" | "observation" | "improvement";
  area: string;
  description: string;
  severity: number;
  recommendation: string;
}

export class AuditBotAgent extends BaseAgent {
  constructor() {
    super(AUDITBOT_CONFIG);
  }

  protected async gatherObservations(context: AgentContext): Promise<AgentObservation[]> {
    const observations: AgentObservation[] = [];

    try {
      // 1. Check access logs for anomalies
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: accessLogs } = await supabase
        .from("access_logs")
        .select("id, action, result, severity, module_accessed, created_at")
        .gte("created_at", oneDayAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (accessLogs) {
        const failedAccess = accessLogs.filter(l => l.result === "denied" || l.result === "failed");
        const highSeverity = accessLogs.filter(l => l.severity === "high" || l.severity === "critical");

        if (failedAccess.length > 0) {
          observations.push({
            id: crypto.randomUUID(),
            type: "anomaly",
            data: {
              auditArea: "access_control",
              failedAttempts: failedAccess.length,
              totalAttempts: accessLogs.length,
              failureRate: failedAccess.length / accessLogs.length,
              samples: failedAccess.slice(0, 5),
            },
            source: "access_logs",
            timestamp: new Date(),
            priority: failedAccess.length > 10 ? 8 : failedAccess.length > 5 ? 6 : 4,
          });
        }

        if (highSeverity.length > 0) {
          observations.push({
            id: crypto.randomUUID(),
            type: "alert",
            data: {
              auditArea: "security_events",
              highSeverityCount: highSeverity.length,
              events: highSeverity.slice(0, 5).map(e => ({
                action: e.action,
                module: e.module_accessed,
                severity: e.severity,
              })),
            },
            source: "access_logs",
            timestamp: new Date(),
            priority: 9,
          });
        }
      }

      // 2. Check audit center logs for pending items
      const { data: auditLogs } = await supabase
        .from("audit_center_logs")
        .select("id, audit_type, action, compliance_score, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (auditLogs) {
        const lowCompliance = auditLogs.filter(a => (a.compliance_score || 100) < 80);
        
        if (lowCompliance.length > 0) {
          observations.push({
            id: crypto.randomUUID(),
            type: "pattern",
            data: {
              auditArea: "compliance_scores",
              lowComplianceCount: lowCompliance.length,
              avgScore: lowCompliance.reduce((s, a) => s + (a.compliance_score || 0), 0) / lowCompliance.length,
              audits: lowCompliance.slice(0, 5),
            },
            source: "audit_center_logs",
            timestamp: new Date(),
            priority: 7,
          });
        }
      }

      // 3. Check for data integrity in key tables
      const { count: vesselCount } = await supabase
        .from("vessels")
        .select("*", { count: "exact", head: true });

      const { count: crewCount } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true });

      observations.push({
        id: crypto.randomUUID(),
        type: "metric",
        data: {
          auditArea: "data_integrity",
          recordCounts: {
            vessels: vesselCount || 0,
            crew: crewCount || 0,
          },
          timestamp: new Date().toISOString(),
        },
        source: "system_health",
        timestamp: new Date(),
        priority: 2,
      });

      logger.info(`[AuditBot] Gathered ${observations.length} audit observations`);
      return observations.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.error("[AuditBot] Failed to gather observations", { error });
      return observations;
    }
  }

  async analyze(observations: AgentObservation[]): Promise<AgentDecision[]> {
    const decisions: AgentDecision[] = [];
    const findings: AuditFinding[] = [];

    for (const obs of observations) {
      const area = String(obs.data.auditArea || "general");

      if (obs.type === "anomaly" && area === "access_control") {
        const failureRate = Number(obs.data.failureRate || 0);
        if (failureRate > 0.1) {
          findings.push({
            id: crypto.randomUUID(),
            type: "warning",
            area: "Controle de Acesso",
            description: `Taxa de falha de ${(Number(failureRate) * 100).toFixed(1)}% detectada`,
            severity: Number(failureRate) > 0.2 ? 8 : 5,
            recommendation: "Revisar políticas de acesso e verificar tentativas suspeitas",
          });
        }
      }

      if (obs.type === "alert" && area === "security_events") {
        findings.push({
          id: crypto.randomUUID(),
          type: "violation",
          area: "Segurança",
          description: `${Number(obs.data.highSeverityCount)} eventos de alta severidade detectados`,
          severity: 9,
          recommendation: "Investigar imediatamente e tomar ações corretivas",
        });
      }

      if (obs.type === "pattern" && area === "compliance_scores") {
        findings.push({
          id: crypto.randomUUID(),
          type: "observation",
          area: "Compliance",
          description: `${Number(obs.data.lowComplianceCount)} auditorias com score abaixo de 80%`,
          severity: 6,
          recommendation: "Planejar ações corretivas para melhorar compliance",
        });
      }
    }

    if (findings.length > 0) {
      const maxSeverity = Math.max(...findings.map(f => f.severity));
      const impact = maxSeverity >= 8 ? "critical" : maxSeverity >= 6 ? "high" : maxSeverity >= 4 ? "medium" : "low";

      decisions.push({
        id: crypto.randomUUID(),
        agentType: "audit",
        action: `Relatório de Auditoria: ${findings.length} achados identificados`,
        reasoning: findings.map(f => `[${f.area}] ${f.description}`).join("; "),
        confidence: "high",
        confidenceScore: 0.88,
        impact,
        requiresApproval: impact === "critical",
        autoExecute: impact !== "critical",
        parameters: {
          findingsCount: findings.length,
          findings,
          maxSeverity,
        },
        createdAt: new Date(),
      });
    }

    logger.info(`[AuditBot] Generated ${decisions.length} audit decisions with ${findings.length} findings`);
    return decisions;
  }

  async execute(decision: AgentDecision): Promise<AgentAction> {
    const actionId = crypto.randomUUID();

    try {
      // Log audit report
      await supabase.from("audit_center_logs").insert({
        audit_id: decision.id,
        audit_type: "automated_audit",
        action: decision.action,
        compliance_score: decision.impact === "low" ? 95 : decision.impact === "medium" ? 80 : decision.impact === "high" ? 65 : 50,
        checklist_data: (decision.parameters?.findings || []) as unknown as import("@/integrations/supabase/types").Json,
        metadata: {
          agentVersion: "1.0",
          analysisTimestamp: new Date().toISOString(),
        },
      } as never);

      // Create insight for dashboard
      await supabase.from("analytics_insights").insert({
        title: `📋 AuditBot: ${decision.action}`,
        content: decision.reasoning,
        insight_type: "audit_report",
        priority: decision.impact,
        is_actionable: true,
        confidence: decision.confidenceScore,
        data_reference: decision.parameters as unknown as import("@/integrations/supabase/types").Json,
      } as never);

      return {
        id: actionId,
        decisionId: decision.id,
        type: "report",
        status: "completed",
        result: { 
          auditCompleted: true, 
          findingsCount: decision.parameters?.findingsCount 
        },
        executedAt: new Date(),
      };
    } catch (error) {
      return {
        id: actionId,
        decisionId: decision.id,
        type: "report",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async learn(action: AgentAction, outcome: "success" | "failure"): Promise<void> {
    logger.info("[AuditBot] Learning from action outcome", { 
      actionId: action.id, 
      outcome 
    });
  }
}

// Singleton
let auditBotInstance: AuditBotAgent | null = null;

export function getAuditBot(): AuditBotAgent {
  if (!auditBotInstance) {
    auditBotInstance = new AuditBotAgent();
  }
  return auditBotInstance;
}
