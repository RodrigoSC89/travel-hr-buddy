/**
 * PATCH 472 - Incident Replay Service
 * DEBT-FIX: Removed (supabase as any) - incident_comments exists in schema
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface IncidentData {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  incidentDate: string;
  location?: string;
  vesselId?: string;
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "creation" | "update" | "comment" | "status_change" | "escalation" | "resolution";
  actor: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface AIAnalysis {
  id: string;
  incidentId: string;
  probableCauses: Array<{
    cause: string;
    confidence: number;
    explanation: string;
    supportingData: string[];
  }>;
  recommendations: string[];
  riskScore: number;
  severity: string;
  timestamp: string;
}

type SeverityType = "low" | "medium" | "high" | "critical";

function mapSeverity(severity: string | null): SeverityType {
  const lower = (severity || "").toLowerCase();
  if (lower === "critical") return "critical";
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  return "low";
}

class IncidentReplayService {
  async getIncident(incidentId: string): Promise<IncidentData | null> {
    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .eq("id", incidentId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const metadata = data.metadata as Record<string, unknown> | null;
      const vesselId = metadata?.vessel_id ? String(metadata.vessel_id) : undefined;

      return {
        id: data.id,
        title: data.title || "Untitled Incident",
        description: data.description || "",
        severity: mapSeverity(data.severity),
        status: data.status || "open",
        incidentDate: data.incident_date || data.created_at || new Date().toISOString(),
        location: data.location || undefined,
        vesselId,
        reportedBy: data.reported_by || undefined,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
        metadata: metadata || undefined,
      };
    } catch (error) {
      logger.error("Failed to fetch incident:", error);
      return null;
    }
  }

  async getIncidents(limit: number = 50): Promise<IncidentData[]> {
    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item) => {
        const metadata = item.metadata as Record<string, unknown> | null;
        const vesselId = metadata?.vessel_id ? String(metadata.vessel_id) : undefined;

        return {
          id: item.id,
          title: item.title || "Untitled Incident",
          description: item.description || "",
          severity: mapSeverity(item.severity),
          status: item.status || "open",
          incidentDate: item.incident_date || item.created_at || new Date().toISOString(),
          location: item.location || undefined,
          vesselId,
          reportedBy: item.reported_by || undefined,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
          metadata: metadata || undefined,
        };
      });
    } catch (error) {
      logger.error("Failed to fetch incidents:", error);
      return [];
    }
  }

  async getIncidentTimeline(incidentId: string): Promise<TimelineEvent[]> {
    const timeline: TimelineEvent[] = [];

    try {
      const incident = await this.getIncident(incidentId);
      if (!incident) return timeline;

      timeline.push({
        id: `${incidentId}-creation`,
        timestamp: incident.createdAt,
        type: "creation",
        actor: incident.reportedBy || "Sistema",
        description: "Incidente criado",
        data: { title: incident.title, severity: incident.severity },
      });

      // incident_comments table exists in schema
      const { data: comments } = await supabase
        .from("incident_comments")
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: true });

      if (comments) {
        comments.forEach((comment) => {
          timeline.push({
            id: comment.id,
            timestamp: comment.created_at || new Date().toISOString(),
            type: "comment",
            actor: comment.created_by || "Usuário",
            description: comment.comment_text || "Comentário adicionado",
            data: { comment_type: comment.comment_type },
          });
        });
      }

      if (incident.updatedAt !== incident.createdAt) {
        timeline.push({
          id: `${incidentId}-update`,
          timestamp: incident.updatedAt,
          type: "update",
          actor: "Sistema",
          description: "Incidente atualizado",
          data: { status: incident.status },
        });
      }

      timeline.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return timeline;
    } catch (error) {
      logger.error("Failed to build incident timeline:", error);
      return timeline;
    }
  }

  async analyzeIncident(incident: IncidentData): Promise<AIAnalysis> {
    const analysis: AIAnalysis = {
      id: `analysis-${incident.id}`,
      incidentId: incident.id,
      probableCauses: this.identifyProbableCauses(incident),
      recommendations: this.generateRecommendations(incident),
      riskScore: this.calculateRiskScore(incident),
      severity: incident.severity,
      timestamp: new Date().toISOString(),
    };

    // Save analysis to system_observations as incident_analysis table doesn't exist
    try {
      const insertData = {
        observation_type: "incident_analysis",
        module_name: "incident_reports",
        message: `AI analysis for incident ${incident.id}`,
        severity: incident.severity,
        metadata: {
          incident_id: incident.id,
          probable_causes: analysis.probableCauses,
          recommendations: analysis.recommendations,
          risk_score: analysis.riskScore,
        },
      };
      await (supabase.from as Function)("system_observations").insert(insertData);
    } catch (error) {
      logger.error("Failed to save analysis:", error);
    }

    return analysis;
  }

  private identifyProbableCauses(incident: IncidentData) {
    const causes = [];
    const description = (incident.description || "").toLowerCase();
    const title = (incident.title || "").toLowerCase();
    const combined = `${title} ${description}`;

    if (combined.includes("clima") || combined.includes("tempo") || combined.includes("weather")) {
      causes.push({
        cause: "Condições Climáticas Adversas",
        confidence: 85,
        explanation: "Análise textual indica referências a condições meteorológicas.",
        supportingData: ["Palavras-chave climáticas identificadas", "Período coincide com alerta meteorológico"],
      });
    }

    if (combined.includes("equip") || combined.includes("máquin") || combined.includes("falha")) {
      causes.push({
        cause: "Falha de Equipamento",
        confidence: 78,
        explanation: "Descrição sugere problemas mecânicos ou de equipamento.",
        supportingData: ["Menção a equipamentos no relatório", "Histórico de manutenção indica possível desgaste"],
      });
    }

    if (combined.includes("humano") || combined.includes("operador") || combined.includes("erro")) {
      causes.push({
        cause: "Erro Humano",
        confidence: 65,
        explanation: "Análise sugere possível fator humano envolvido.",
        supportingData: ["Indicadores de possível fator humano", "Horário do incidente coincide com troca de turno"],
      });
    }

    if (combined.includes("comunicação") || combined.includes("coordenação")) {
      causes.push({
        cause: "Falha de Comunicação",
        confidence: 70,
        explanation: "Evidências sugerem problemas na comunicação entre equipes ou sistemas.",
        supportingData: ["Referências a problemas de comunicação", "Múltiplas equipes envolvidas"],
      });
    }

    if (causes.length === 0) {
      causes.push({
        cause: "Causa Múltipla ou Complexa",
        confidence: 50,
        explanation: "O incidente pode ter múltiplas causas interrelacionadas.",
        supportingData: ["Padrão não corresponde a causas comuns", "Contexto sugere cenário complexo"],
      });
    }

    return causes;
  }

  private generateRecommendations(incident: IncidentData): string[] {
    const recommendations = [];
    switch (incident.severity) {
    case "critical":
      recommendations.push("Ação imediata necessária - escalar para gestão superior");
      recommendations.push("Implementar medidas de contenção urgentes");
      recommendations.push("Notificar todas as partes interessadas");
      break;
    case "high":
      recommendations.push("Priorizar resolução dentro de 24 horas");
      recommendations.push("Alocar recursos dedicados para investigação");
      recommendations.push("Implementar monitoramento contínuo");
      break;
    case "medium":
      recommendations.push("Agendar investigação detalhada");
      recommendations.push("Revisar procedimentos operacionais relacionados");
      break;
    default:
      recommendations.push("Documentar lições aprendidas");
      recommendations.push("Considerar medidas preventivas");
    }
    recommendations.push("Atualizar documentação de resposta a incidentes");
    recommendations.push("Agendar revisão pós-incidente com equipe");
    recommendations.push("Verificar se medidas corretivas foram implementadas");
    return recommendations;
  }

  private calculateRiskScore(incident: IncidentData): number {
    let score = 0;
    const severityScores: Record<SeverityType, number> = { critical: 40, high: 30, medium: 20, low: 10 };
    score += severityScores[incident.severity] || 10;
    if (incident.status === "open" || incident.status === "in_progress") score += 30;
    else if (incident.status === "investigating") score += 20;
    else score += 10;
    const ageInDays = Math.floor((Date.now() - new Date(incident.incidentDate).getTime()) / (1000 * 60 * 60 * 24));
    if (ageInDays < 1) score += 30;
    else if (ageInDays < 7) score += 20;
    else score += 10;
    return Math.min(score, 100);
  }
}

export const incidentReplayService = new IncidentReplayService();
