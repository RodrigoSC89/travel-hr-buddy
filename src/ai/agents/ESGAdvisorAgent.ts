/**
 * 🌱 ESG-Advisor Agent
 * Agente autônomo para monitoramento ambiental, social e de governança
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

const ESG_ADVISOR_CONFIG: AgentConfig = {
  type: "esg",
  name: "ESG-Advisor",
  description: "Agente autônomo para análise e recomendações ESG",
  capabilities: [
    "environmental_monitoring",
    "social_impact_analysis",
    "governance_compliance",
    "sustainability_reporting",
    "carbon_footprint_tracking",
  ],
  autoExecutionThreshold: 0.80,
  maxConcurrentTasks: 3,
  learningEnabled: true,
  escalationRules: [
    {
      condition: "environmental_violation",
      action: "escalate",
      targets: ["sustainability_officer", "operations_director"],
      priority: 1,
    },
  ],
};

interface ESGMetrics {
  environmental: { score: number; issues: string[] };
  social: { score: number; issues: string[] };
  governance: { score: number; issues: string[] };
}

export class ESGAdvisorAgent extends BaseAgent {
  private esgWeights = {
    environmental: 0.4,
    social: 0.3,
    governance: 0.3,
  };

  constructor() {
    super(ESG_ADVISOR_CONFIG);
  }

  protected async gatherObservations(context: AgentContext): Promise<AgentObservation[]> {
    const observations: AgentObservation[] = [];

    try {
      // 1. Environmental: Check vessel compliance and fuel efficiency
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type")
        .limit(30);

      if (vessels) {
        const activeVessels = vessels.filter(v => v.status === "active");
        const maintenanceVessels = vessels.filter(v => v.status === "maintenance");
        
        // Environmental efficiency observation
        observations.push({
          id: crypto.randomUUID(),
          type: "metric",
          data: {
            category: "environmental",
            metric: "fleet_efficiency",
            activeCount: activeVessels.length,
            maintenanceCount: maintenanceVessels.length,
            efficiencyRate: activeVessels.length / (vessels.length || 1),
          },
          source: "vessels",
          timestamp: new Date(),
          priority: maintenanceVessels.length > vessels.length * 0.2 ? 7 : 3,
        });
      }

      // 2. Social: Crew welfare and training
      const { data: crew } = await supabase
        .from("crew_members")
        .select("id, status, nationality")
        .limit(100);

      if (crew) {
        const activeCrews = crew.filter(c => c.status === "active");
        const diversityMap = new Map<string, number>();
        
        crew.forEach(c => {
          const nat = c.nationality || "unknown";
          diversityMap.set(nat, (diversityMap.get(nat) || 0) + 1);
        });

        observations.push({
          id: crypto.randomUUID(),
          type: "metric",
          data: {
            category: "social",
            metric: "workforce_diversity",
            totalCrew: crew.length,
            activeCrew: activeCrews.length,
            nationalityCount: diversityMap.size,
            diversityIndex: diversityMap.size / Math.max(crew.length * 0.1, 1),
          },
          source: "crew_members",
          timestamp: new Date(),
          priority: 4,
        });
      }

      // 3. Governance: Audit and compliance checks
      const { data: audits } = await supabase
        .from("audit_center_logs")
        .select("id, audit_type, compliance_score, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (audits && audits.length > 0) {
        const avgCompliance = audits.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / audits.length;
        
        observations.push({
          id: crypto.randomUUID(),
          type: "metric",
          data: {
            category: "governance",
            metric: "compliance_score",
            avgScore: avgCompliance,
            auditCount: audits.length,
            recentAudits: audits.slice(0, 5).map(a => ({
              type: a.audit_type,
              score: a.compliance_score,
            })),
          },
          source: "audit_center_logs",
          timestamp: new Date(),
          priority: avgCompliance < 70 ? 8 : avgCompliance < 85 ? 5 : 2,
        });
      }

      logger.info(`[ESG-Advisor] Gathered ${observations.length} ESG observations`);
      return observations;
    } catch (error) {
      logger.error("[ESG-Advisor] Failed to gather observations", { error });
      return observations;
    }
  }

  async analyze(observations: AgentObservation[]): Promise<AgentDecision[]> {
    const decisions: AgentDecision[] = [];
    const metrics: ESGMetrics = {
      environmental: { score: 100, issues: [] },
      social: { score: 100, issues: [] },
      governance: { score: 100, issues: [] },
    };

    // Process observations by category
    for (const obs of observations) {
      const category = String(obs.data.category) as keyof ESGMetrics;
      if (!category || !metrics[category]) continue;

      if (obs.data.metric === "fleet_efficiency") {
        const efficiency = Number(obs.data.efficiencyRate || 1);
        metrics.environmental.score = Math.min(metrics.environmental.score, efficiency * 100);
        if (efficiency < 0.8) {
          metrics.environmental.issues.push("Eficiência da frota abaixo do ideal");
        }
      }

      if (obs.data.metric === "workforce_diversity") {
        const diversity = Number(obs.data.diversityIndex || 0);
        metrics.social.score = Math.min(metrics.social.score, Math.min(diversity * 50, 100));
        if (diversity < 0.5) {
          metrics.social.issues.push("Índice de diversidade pode ser melhorado");
        }
      }

      if (obs.data.metric === "compliance_score") {
        metrics.governance.score = Number(obs.data.avgScore || 100);
        if (metrics.governance.score < 85) {
          metrics.governance.issues.push(`Score de compliance em ${metrics.governance.score.toFixed(1)}%`);
        }
      }
    }

    // Calculate overall ESG score
    const overallScore = 
      metrics.environmental.score * this.esgWeights.environmental +
      metrics.social.score * this.esgWeights.social +
      metrics.governance.score * this.esgWeights.governance;

    // Generate decision based on overall ESG status
    const allIssues = [
      ...metrics.environmental.issues,
      ...metrics.social.issues,
      ...metrics.governance.issues,
    ];

    if (allIssues.length > 0 || overallScore < 85) {
      const impact = overallScore < 60 ? "critical" : overallScore < 75 ? "high" : overallScore < 85 ? "medium" : "low";
      const confidence = 0.85;

      decisions.push({
        id: crypto.randomUUID(),
        agentType: "esg",
        action: `Relatório ESG: Score geral ${overallScore.toFixed(1)}% - ${allIssues.length} pontos de atenção`,
        reasoning: allIssues.length > 0 
          ? `Identificados: ${allIssues.join("; ")}` 
          : "Performance ESG dentro dos parâmetros",
        confidence: confidence >= 0.9 ? "critical" : confidence >= 0.8 ? "high" : "medium",
        confidenceScore: confidence,
        impact,
        requiresApproval: impact === "critical" || impact === "high",
        autoExecute: impact !== "critical",
        parameters: {
          overallScore,
          environmental: metrics.environmental,
          social: metrics.social,
          governance: metrics.governance,
        },
        createdAt: new Date(),
      });
    }

    logger.info(`[ESG-Advisor] Generated ${decisions.length} ESG decisions`);
    return decisions;
  }

  async execute(decision: AgentDecision): Promise<AgentAction> {
    const actionId = crypto.randomUUID();

    try {
      // Create ESG insight
      await supabase.from("analytics_insights").insert({
        title: `🌱 ESG-Advisor: ${decision.action}`,
        content: decision.reasoning,
        insight_type: "esg_report",
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
        result: { reportGenerated: true, esgScore: decision.parameters?.overallScore },
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
    // Adjust weights based on feedback
    if (outcome === "success") {
      logger.info("[ESG-Advisor] Learning from successful action", { actionId: action.id });
    }
  }
}

// Singleton
let esgAdvisorInstance: ESGAdvisorAgent | null = null;

export function getESGAdvisor(): ESGAdvisorAgent {
  if (!esgAdvisorInstance) {
    esgAdvisorInstance = new ESGAdvisorAgent();
  }
  return esgAdvisorInstance;
}
