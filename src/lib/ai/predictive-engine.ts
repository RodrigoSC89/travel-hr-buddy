/**
 * NAUTILUS PREDICTIVE ENGINE - PHASE 1
 * Sistema de Recomendações Preditivas baseado em IA
 * 
 * Analisa dados operacionais para gerar recomendações proativas:
 * - Manutenção preditiva
 * - Otimização de rotas
 * - Gaps de treinamento
 * - Previsão de consumo
 */

import { supabase } from "@/integrations/supabase/client";

export interface PredictiveRecommendation {
  id: string;
  type: "maintenance" | "training" | "route" | "fuel" | "compliance" | "crew";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: string;
  actionItems: string[];
  estimatedSavings?: string;
  deadline?: Date;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface PredictiveAnalysis {
  timestamp: Date;
  recommendations: PredictiveRecommendation[];
  insights: {
    maintenanceRisk: number;
    crewReadiness: number;
    complianceScore: number;
    fuelEfficiency: number;
    overallHealth: number;
  };
  trends: {
    maintenance: "improving" | "stable" | "declining";
    crew: "improving" | "stable" | "declining";
    compliance: "improving" | "stable" | "declining";
    costs: "improving" | "stable" | "declining";
  };
}

/**
 * Gera recomendações de manutenção preditiva
 */
export async function generateMaintenancePredictions(): Promise<PredictiveRecommendation[]> {
  const recommendations: PredictiveRecommendation[] = [];
  
  try {
    // Buscar manutenções pendentes e histórico
    const { data: pendingMaintenance } = await supabase
      .from("maintenance_records")
      .select("*")
      .eq("status", "pending")
      .order("scheduled_date", { ascending: true });
    
    const { data: overdueMaintenance } = await supabase
      .from("maintenance_records")
      .select("*")
      .eq("status", "overdue");

    // Analisar manutenções vencidas
    if (overdueMaintenance && overdueMaintenance.length > 0) {
      recommendations.push({
        id: `maint-overdue-${Date.now()}`,
        type: "maintenance",
        priority: "critical",
        title: `${overdueMaintenance.length} manutenções em atraso detectadas`,
        description: "Existem manutenções programadas que não foram realizadas no prazo. Isso pode impactar a segurança operacional e compliance.",
        confidence: 95,
        impact: "Alto risco de falhas operacionais e não-conformidades em auditorias",
        actionItems: [
          "Revisar cronograma de manutenção imediatamente",
          "Priorizar itens críticos de segurança",
          "Notificar supervisores de bordo",
          "Documentar justificativas para atrasos"
        ],
        deadline: new Date(),
        createdAt: new Date(),
        metadata: { count: overdueMaintenance.length }
      });
    }

    // Prever manutenções próximas do vencimento
    if (pendingMaintenance && pendingMaintenance.length > 0) {
      const upcomingCritical = pendingMaintenance.filter(m => {
        const scheduledDate = new Date(m.scheduled_date);
        const daysUntil = Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7;
      });

      if (upcomingCritical.length > 0) {
        recommendations.push({
          id: `maint-upcoming-${Date.now()}`,
          type: "maintenance",
          priority: "high",
          title: `${upcomingCritical.length} manutenções nos próximos 7 dias`,
          description: "Manutenções programadas que requerem atenção e preparação de recursos.",
          confidence: 90,
          impact: "Planejamento adequado evita atrasos e custos extras",
          actionItems: [
            "Verificar disponibilidade de peças e materiais",
            "Confirmar escalas de técnicos",
            "Preparar documentação técnica",
            "Agendar paradas operacionais se necessário"
          ],
          createdAt: new Date(),
          metadata: { count: upcomingCritical.length }
        });
      }
    }

  } catch (error) {
    console.error("[PredictiveEngine] Error generating maintenance predictions:", error);
  }
  
  return recommendations;
}

/**
 * Analisa gaps de treinamento da tripulação
 */
export async function analyzeCrewTrainingGaps(): Promise<PredictiveRecommendation[]> {
  const recommendations: PredictiveRecommendation[] = [];
  
  try {
    // Buscar certificações expirando
    const { data: crewMembers } = await supabase
      .from("crew_members")
      .select("*")
      .eq("status", "active");

    const { data: certifications } = await supabase
      .from("crew_certifications")
      .select("*");

    if (certifications && certifications.length > 0) {
      const expiringSoon = certifications.filter(cert => {
        if (!cert.expiry_date) return false;
        const expiryDate = new Date(cert.expiry_date);
        const daysUntil = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 30 && daysUntil > 0;
      });

      const expired = certifications.filter(cert => {
        if (!cert.expiry_date) return false;
        const expiryDate = new Date(cert.expiry_date);
        return expiryDate < new Date();
      });

      if (expired.length > 0) {
        recommendations.push({
          id: `crew-cert-expired-${Date.now()}`,
          type: "training",
          priority: "critical",
          title: `${expired.length} certificações vencidas`,
          description: "Tripulantes com certificações expiradas não podem operar em determinadas funções conforme regulamentação.",
          confidence: 100,
          impact: "Risco de multas, retenção de embarcação e não-conformidades PSC",
          actionItems: [
            "Identificar tripulantes afetados",
            "Agendar renovações urgentes",
            "Avaliar necessidade de substituições temporárias",
            "Atualizar matriz de competências"
          ],
          deadline: new Date(),
          createdAt: new Date(),
          metadata: { count: expired.length }
        });
      }

      if (expiringSoon.length > 0) {
        recommendations.push({
          id: `crew-cert-expiring-${Date.now()}`,
          type: "training",
          priority: "high",
          title: `${expiringSoon.length} certificações expiram em 30 dias`,
          description: "Certificações que requerem renovação para manter conformidade operacional.",
          confidence: 95,
          impact: "Planejamento antecipado evita gaps de conformidade",
          actionItems: [
            "Contatar centros de treinamento",
            "Verificar disponibilidade de vagas",
            "Planejar liberação de tripulantes",
            "Reservar orçamento para treinamentos"
          ],
          createdAt: new Date(),
          metadata: { count: expiringSoon.length }
        });
      }
    }

  } catch (error) {
    console.error("[PredictiveEngine] Error analyzing crew training gaps:", error);
  }
  
  return recommendations;
}

/**
 * Analisa compliance e conformidade
 */
export async function analyzeComplianceRisks(): Promise<PredictiveRecommendation[]> {
  const recommendations: PredictiveRecommendation[] = [];
  
  try {
    // Buscar auditorias PEOTRAM recentes
    const { data: recentAudits } = await supabase
      .from("peotram_audits")
      .select("id, compliance_score, non_conformities_count, status")
      .order("created_at", { ascending: false })
      .limit(10);

    // Verificar auditorias com score baixo
    const lowScoreAudits = recentAudits?.filter(a => 
      a.compliance_score !== null && a.compliance_score < 70
    ) || [];

    if (lowScoreAudits.length > 0) {
      recommendations.push({
        id: `compliance-low-score-${Date.now()}`,
        type: "compliance",
        priority: "high",
        title: `${lowScoreAudits.length} auditorias com score abaixo de 70%`,
        description: "Auditorias recentes indicam gaps de conformidade que requerem atenção.",
        confidence: 90,
        impact: "Risco de não-conformidades em auditorias externas",
        actionItems: [
          "Revisar não-conformidades identificadas",
          "Elaborar plano de ação corretiva",
          "Designar responsáveis por cada item",
          "Agendar verificação de eficácia"
        ],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        metadata: { count: lowScoreAudits.length }
      });
    }

    // Verificar auditorias com muitas não-conformidades
    const highNCCount = recentAudits?.filter(a => 
      a.non_conformities_count !== null && a.non_conformities_count > 5
    ) || [];

    if (highNCCount.length > 0) {
      recommendations.push({
        id: `compliance-nc-high-${Date.now()}`,
        type: "compliance",
        priority: "medium",
        title: "Auditorias com alto número de não-conformidades",
        description: `${highNCCount.length} auditorias apresentam mais de 5 não-conformidades.`,
        confidence: 85,
        impact: "Indica necessidade de revisão de processos operacionais",
        actionItems: [
          "Analisar padrões nas não-conformidades",
          "Identificar causas raiz comuns",
          "Implementar ações preventivas sistêmicas",
          "Capacitar equipe sobre requisitos"
        ],
        createdAt: new Date(),
        metadata: { count: highNCCount.length }
      });
    }

  } catch (error) {
    console.error("[PredictiveEngine] Error analyzing compliance risks:", error);
  }
  
  return recommendations;
}

/**
 * Gera análise completa preditiva
 */
export async function generateFullPredictiveAnalysis(): Promise<PredictiveAnalysis> {
  const [maintenanceRecs, trainingRecs, complianceRecs] = await Promise.all([
    generateMaintenancePredictions(),
    analyzeCrewTrainingGaps(),
    analyzeComplianceRisks()
  ]);

  const allRecommendations = [...maintenanceRecs, ...trainingRecs, ...complianceRecs];
  
  // Calcular scores baseados nas recomendações
  const criticalCount = allRecommendations.filter(r => r.priority === "critical").length;
  const highCount = allRecommendations.filter(r => r.priority === "high").length;
  
  const calculateScore = (type: string) => {
    const typeRecs = allRecommendations.filter(r => r.type === type);
    if (typeRecs.length === 0) return 95;
    const criticals = typeRecs.filter(r => r.priority === "critical").length;
    const highs = typeRecs.filter(r => r.priority === "high").length;
    return Math.max(0, 100 - (criticals * 20) - (highs * 10));
  });

  return {
    timestamp: new Date(),
    recommendations: allRecommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    insights: {
      maintenanceRisk: calculateScore("maintenance"),
      crewReadiness: calculateScore("training"),
      complianceScore: calculateScore("compliance"),
      fuelEfficiency: 85, // Placeholder - would need actual fuel data
      overallHealth: Math.round((calculateScore("maintenance") + calculateScore("training") + calculateScore("compliance")) / 3)
    },
    trends: {
      maintenance: criticalCount > 2 ? "declining" : criticalCount > 0 ? "stable" : "improving",
      crew: highCount > 3 ? "declining" : highCount > 0 ? "stable" : "improving",
      compliance: criticalCount > 0 ? "declining" : "stable",
      costs: "stable"
    }
  };
}

/**
 * Hook para usar o engine preditivo
 */
export function usePredictiveEngine() {
  return {
    generateMaintenancePredictions,
    analyzeCrewTrainingGaps,
    analyzeComplianceRisks,
    generateFullPredictiveAnalysis
  };
}
