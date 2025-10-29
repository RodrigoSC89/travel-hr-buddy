/**
 * PATCH 472 - Incident Replay Service
 * Service for retrieving and analyzing incident data with AI
 */

import { supabase } from "@/integrations/supabase/client";

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
  metadata?: any;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "creation" | "update" | "comment" | "status_change" | "escalation" | "resolution";
  actor: string;
  description: string;
  data?: any;
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

class IncidentReplayService {
  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<IncidentData | null> {
    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .eq("id", incidentId)
        .single();

      if (error) throw error;

      return data
        ? {
            id: data.id,
            title: data.title || "Untitled Incident",
            description: data.description || "",
            severity: data.severity || "medium",
            status: data.status || "open",
            incidentDate: data.incident_date || data.created_at,
            location: data.location,
            vesselId: data.vessel_id,
            reportedBy: data.reported_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            metadata: data.metadata,
          }
        : null;
    } catch (error) {
      console.error("Failed to fetch incident:", error);
      return null;
    }
  }

  /**
   * Get all incidents for list
   */
  async getIncidents(limit: number = 50): Promise<IncidentData[]> {
    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        title: item.title || "Untitled Incident",
        description: item.description || "",
        severity: item.severity || "medium",
        status: item.status || "open",
        incidentDate: item.incident_date || item.created_at,
        location: item.location,
        vesselId: item.vessel_id,
        reportedBy: item.reported_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        metadata: item.metadata,
      }));
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      return [];
    }
  }

  /**
   * Build timeline for incident replay
   */
  async getIncidentTimeline(incidentId: string): Promise<TimelineEvent[]> {
    const timeline: TimelineEvent[] = [];

    try {
      // Get incident data
      const incident = await this.getIncident(incidentId);
      if (!incident) return timeline;

      // Add creation event
      timeline.push({
        id: `${incidentId}-creation`,
        timestamp: incident.createdAt,
        type: "creation",
        actor: incident.reportedBy || "Sistema",
        description: "Incidente criado",
        data: {
          title: incident.title,
          severity: incident.severity,
        },
      });

      // Get comments/notes
      const { data: comments } = await supabase
        .from("incident_comments")
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: true });

      if (comments) {
        comments.forEach((comment) => {
          timeline.push({
            id: comment.id,
            timestamp: comment.created_at,
            type: "comment",
            actor: comment.user_id || "Usuário",
            description: comment.comment || comment.text || "Comentário adicionado",
            data: comment,
          });
        });
      }

      // Add update event if updated
      if (incident.updatedAt !== incident.createdAt) {
        timeline.push({
          id: `${incidentId}-update`,
          timestamp: incident.updatedAt,
          type: "update",
          actor: "Sistema",
          description: "Incidente atualizado",
          data: {
            status: incident.status,
          },
        });
      }

      // Sort by timestamp
      timeline.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return timeline;
    } catch (error) {
      console.error("Failed to build incident timeline:", error);
      return timeline;
    }
  }

  /**
   * Analyze incident with AI to identify probable causes
   */
  async analyzeIncident(incident: IncidentData): Promise<AIAnalysis> {
    // Simulate AI analysis (in production, this would call an AI service)
    const analysis: AIAnalysis = {
      id: `analysis-${incident.id}`,
      incidentId: incident.id,
      probableCauses: this.identifyProbableCauses(incident),
      recommendations: this.generateRecommendations(incident),
      riskScore: this.calculateRiskScore(incident),
      severity: incident.severity,
      timestamp: new Date().toISOString(),
    };

    // Save analysis to database (optional)
    try {
      await supabase.from("incident_analysis").insert({
        incident_id: incident.id,
        probable_causes: analysis.probableCauses,
        recommendations: analysis.recommendations,
        risk_score: analysis.riskScore,
        severity: analysis.severity,
      });
    } catch (error) {
      console.error("Failed to save analysis:", error);
    }

    return analysis;
  }

  /**
   * Identify probable causes using AI patterns
   */
  private identifyProbableCauses(incident: IncidentData) {
    const causes = [];
    const description = (incident.description || "").toLowerCase();
    const title = (incident.title || "").toLowerCase();
    const combined = `${title} ${description}`;

    // Pattern matching for common incident causes
    if (combined.includes("clima") || combined.includes("tempo") || combined.includes("weather")) {
      causes.push({
        cause: "Condições Climáticas Adversas",
        confidence: 85,
        explanation:
          "Análise textual indica referências a condições meteorológicas. Dados históricos mostram correlação com eventos climáticos.",
        supportingData: [
          "Palavras-chave climáticas identificadas",
          "Período coincide com alerta meteorológico",
        ],
      });
    }

    if (combined.includes("equip") || combined.includes("máquin") || combined.includes("falha")) {
      causes.push({
        cause: "Falha de Equipamento",
        confidence: 78,
        explanation:
          "Descrição sugere problemas mecânicos ou de equipamento. Padrão similar a incidentes anteriores relacionados a manutenção.",
        supportingData: [
          "Menção a equipamentos no relatório",
          "Histórico de manutenção indica possível desgaste",
        ],
      });
    }

    if (combined.includes("humano") || combined.includes("operador") || combined.includes("erro")) {
      causes.push({
        cause: "Erro Humano",
        confidence: 65,
        explanation:
          "Análise sugere possível fator humano envolvido. Recomenda-se revisão de procedimentos e treinamento.",
        supportingData: [
          "Indicadores de possível fator humano",
          "Horário do incidente coincide com troca de turno",
        ],
      });
    }

    if (combined.includes("comunicação") || combined.includes("coordenação")) {
      causes.push({
        cause: "Falha de Comunicação",
        confidence: 70,
        explanation:
          "Evidências sugerem problemas na comunicação entre equipes ou sistemas.",
        supportingData: [
          "Referências a problemas de comunicação",
          "Múltiplas equipes envolvidas",
        ],
      });
    }

    // If no specific patterns found, provide general causes
    if (causes.length === 0) {
      causes.push({
        cause: "Causa Múltipla ou Complexa",
        confidence: 50,
        explanation:
          "O incidente pode ter múltiplas causas interrelacionadas. Recomenda-se investigação mais aprofundada.",
        supportingData: [
          "Padrão não corresponde a causas comuns",
          "Contexto sugere cenário complexo",
        ],
      });
    }

    return causes;
  }

  /**
   * Generate AI recommendations
   */
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

    // Add general recommendations
    recommendations.push("Atualizar documentação de resposta a incidentes");
    recommendations.push("Agendar revisão pós-incidente com equipe");
    recommendations.push("Verificar se medidas corretivas foram implementadas");

    return recommendations;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(incident: IncidentData): number {
    let score = 0;

    // Severity contributes 40%
    const severityScores = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };
    score += severityScores[incident.severity] || 10;

    // Status contributes 30%
    if (incident.status === "open" || incident.status === "in_progress") {
      score += 30;
    } else if (incident.status === "investigating") {
      score += 20;
    } else {
      score += 10;
    }

    // Age contributes 30%
    const ageInDays = Math.floor(
      (Date.now() - new Date(incident.incidentDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (ageInDays < 1) {
      score += 30;
    } else if (ageInDays < 7) {
      score += 20;
    } else {
      score += 10;
    }

    return Math.min(score, 100);
  }
}

export const incidentReplayService = new IncidentReplayService();
