/**
 * AI Compliance Hook
 * Generates AI-powered recommendations for compliance management
 * Based on ISO 37301 principles
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ComplianceRisk, ComplianceEvidence, ComplianceAIRecommendation } from "../types";

interface AIComplianceInput {
  risks?: ComplianceRisk[];
  evidences?: ComplianceEvidence[];
  context?: string;
}

interface AIComplianceOutput {
  recommendations: Omit<ComplianceAIRecommendation, "id" | "organization_id" | "generated_at">[];
  analysis: string;
  riskScore: number;
  suggestions: string[];
}

export function useAICompliance() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AIComplianceOutput | null>(null);

  const analyzeCompliance = useCallback(async (input: AIComplianceInput): Promise<AIComplianceOutput> => {
    setIsAnalyzing(true);
    
    try {
      // Build analysis prompt
      const risksSummary = input.risks?.map((r) => ({
        title: r.title,
        score: r.risk_score,
        status: r.status,
        level: r.risk_level,
      }));

      const evidencesSummary = input.evidences?.map((e) => ({
        title: e.title,
        status: e.status,
        type: e.document_type,
      }));

      const prompt = `
        Você é um especialista em Compliance e Gestão de Riscos baseado na ISO 37301.
        Analise os seguintes dados e forneça recomendações práticas:

        ${input.context || ""}

        RISCOS IDENTIFICADOS:
        ${JSON.stringify(risksSummary, null, 2)}

        EVIDÊNCIAS:
        ${JSON.stringify(evidencesSummary, null, 2)}

        Forneça:
        1. Análise geral da situação de compliance
        2. Score de risco geral (0-100)
        3. 3-5 recomendações prioritárias com ações sugeridas
        4. Áreas de melhoria identificadas

        Responda em formato JSON estruturado.
      `;

      // Call AI service (fallback to local analysis if unavailable)
      let analysisResult: AIComplianceOutput;

      try {
        const { data, error } = await supabase.functions.invoke("nauti-llm", {
          body: {
            prompt,
            context: "compliance_analysis",
            model: "gpt-4o-mini",
          },
        });

        if (error) throw error;

        // Parse AI response
        const aiResponse = data?.response || data?.text || "";
        analysisResult = parseAIResponse(aiResponse, input);
      } catch (aiError) {
        console.warn("AI service unavailable, using local analysis:", aiError);
        analysisResult = generateLocalAnalysis(input);
      }

      // Save recommendations to database
      if (analysisResult.recommendations.length > 0) {
        const { data: session } = await supabase.auth.getSession();
        const orgId = session?.session?.user?.user_metadata?.organization_id;

        if (orgId) {
          const recommendationsToInsert = analysisResult.recommendations.map((rec) => ({
            ...rec,
            organization_id: orgId,
            generated_at: new Date().toISOString(),
          }));

          await (supabase
            .from("compliance_ai_recommendations" as "profiles")
            .insert(recommendationsToInsert as never[]) as unknown as Promise<{ error: Error | null }>);
        }
      }

      setLastAnalysis(analysisResult);
      toast.success("Análise de compliance concluída");
      return analysisResult;

    } catch (error) {
      console.error("Compliance analysis error:", error);
      toast.error("Erro na análise de compliance");
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzeCompliance,
    isAnalyzing,
    lastAnalysis,
  };
}

function parseAIResponse(response: string, input: AIComplianceInput): AIComplianceOutput {
  try {
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        recommendations: parsed.recommendations || [],
        analysis: parsed.analysis || response,
        riskScore: parsed.riskScore || calculateLocalRiskScore(input),
        suggestions: parsed.suggestions || [],
      };
    }
  } catch {
    // Fallback to text analysis
  }

  return generateLocalAnalysis(input);
}

function generateLocalAnalysis(input: AIComplianceInput): AIComplianceOutput {
  const risks = input.risks || [];
  const evidences = input.evidences || [];

  const criticalRisks = risks.filter((r) => r.risk_level === "critical" || r.risk_level === "high");
  const openRisks = risks.filter((r) => r.status === "open");
  const pendingEvidences = evidences.filter((e) => e.status === "pending_review");
  const expiredEvidences = evidences.filter((e) => e.status === "expired");

  const riskScore = calculateLocalRiskScore(input);

  const recommendations: Omit<ComplianceAIRecommendation, "id" | "organization_id" | "generated_at">[] = [];

  // Generate recommendations based on data analysis
  if (criticalRisks.length > 0) {
    recommendations.push({
      target_type: "risk",
      recommendation_type: "action",
      title: "Riscos Críticos Requerem Ação Imediata",
      recommendation: `Existem ${criticalRisks.length} riscos de nível crítico/alto que precisam de atenção imediata. Priorize a mitigação desses riscos para reduzir a exposição da organização.`,
      reasoning: "Riscos de alto impacto podem causar danos significativos à organização se não forem tratados.",
      confidence: 0.95,
      priority: "critical",
      impact_area: ["operacional", "financeiro", "reputacional"],
      suggested_actions: criticalRisks.slice(0, 3).map((r) => ({
        id: r.id,
        action: `Revisar e mitigar: ${r.title}`,
        priority: "high" as const,
      })),
      status: "pending",
      ai_model: "nautilus-local-compliance",
    });
  }

  if (pendingEvidences.length > 0) {
    recommendations.push({
      target_type: "evidence",
      recommendation_type: "review",
      title: "Evidências Pendentes de Revisão",
      recommendation: `${pendingEvidences.length} evidências aguardam revisão. A falta de validação pode impactar auditorias e certificações.`,
      reasoning: "Evidências não validadas não podem ser utilizadas em processos de auditoria.",
      confidence: 0.85,
      priority: "high",
      impact_area: ["compliance", "auditoria"],
      suggested_actions: [{
        id: "review-evidences",
        action: "Agendar revisão de evidências pendentes",
        priority: "high" as const,
      }],
      status: "pending",
      ai_model: "nautilus-local-compliance",
    });
  }

  if (expiredEvidences.length > 0) {
    recommendations.push({
      target_type: "evidence",
      recommendation_type: "alert",
      title: "Documentos Expirados Detectados",
      recommendation: `${expiredEvidences.length} documentos estão expirados. Renove imediatamente para manter a conformidade.`,
      reasoning: "Documentos expirados invalidam controles de compliance associados.",
      confidence: 0.9,
      priority: "critical",
      impact_area: ["compliance", "legal"],
      suggested_actions: expiredEvidences.slice(0, 3).map((e) => ({
        id: e.id,
        action: `Renovar: ${e.title}`,
        priority: "critical" as const,
      })),
      status: "pending",
      ai_model: "nautilus-local-compliance",
    });
  }

  if (openRisks.length > risks.length * 0.5 && risks.length > 0) {
    recommendations.push({
      target_type: "general",
      recommendation_type: "improvement",
      title: "Taxa de Riscos Abertos Elevada",
      recommendation: `Mais de 50% dos riscos estão em status aberto. Considere revisar os processos de gestão de riscos e alocar mais recursos para mitigação.`,
      reasoning: "Uma alta proporção de riscos abertos indica possíveis lacunas no processo de gestão.",
      confidence: 0.8,
      priority: "medium",
      impact_area: ["processos", "governança"],
      suggested_actions: [{
        id: "risk-review",
        action: "Realizar revisão geral do programa de gestão de riscos",
        priority: "medium" as const,
      }],
      status: "pending",
      ai_model: "nautilus-local-compliance",
    });
  }

  const analysis = `
    **Análise de Compliance - ISO 37301**
    
    📊 **Score de Compliance:** ${riskScore}%
    
    **Resumo:**
    - ${risks.length} riscos mapeados (${openRisks.length} abertos, ${criticalRisks.length} críticos)
    - ${evidences.length} evidências cadastradas (${pendingEvidences.length} pendentes, ${expiredEvidences.length} expiradas)
    
    **Áreas de Atenção:**
    ${criticalRisks.length > 0 ? "⚠️ Riscos críticos requerem ação imediata" : "✅ Sem riscos críticos"}
    ${expiredEvidences.length > 0 ? "⚠️ Documentos expirados detectados" : "✅ Documentos em dia"}
    ${pendingEvidences.length > 0 ? "⚠️ Evidências aguardando revisão" : "✅ Revisões em dia"}
  `.trim();

  const suggestions = [
    criticalRisks.length > 0 ? "Priorizar mitigação de riscos críticos" : null,
    expiredEvidences.length > 0 ? "Renovar documentos expirados" : null,
    pendingEvidences.length > 0 ? "Completar revisões pendentes" : null,
    "Manter calendário de auditorias atualizado",
    "Revisar políticas trimestralmente",
  ].filter(Boolean) as string[];

  return {
    recommendations,
    analysis,
    riskScore,
    suggestions,
  };
}

function calculateLocalRiskScore(input: AIComplianceInput): number {
  const risks = input.risks || [];
  const evidences = input.evidences || [];

  if (risks.length === 0 && evidences.length === 0) return 100;

  let score = 100;

  // Deduct for open/critical risks
  const criticalRisks = risks.filter((r) => r.risk_level === "critical").length;
  const highRisks = risks.filter((r) => r.risk_level === "high").length;
  const openRisks = risks.filter((r) => r.status === "open").length;

  score -= criticalRisks * 10;
  score -= highRisks * 5;
  score -= openRisks * 2;

  // Deduct for evidence issues
  const expiredEvidences = evidences.filter((e) => e.status === "expired").length;
  const pendingEvidences = evidences.filter((e) => e.status === "pending_review").length;

  score -= expiredEvidences * 5;
  score -= pendingEvidences * 2;

  return Math.max(0, Math.min(100, score));
}
