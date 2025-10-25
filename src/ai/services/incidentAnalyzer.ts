/**
 * PATCH 133.0 - AI-based Incident Analyzer
 * Analyzes incidents and provides automated diagnosis, risk assessment, and recommendations
 * 
 * Features:
 * - Probable cause analysis
 * - Suggested actions
 * - Risk level assessment (baixo, moderado, alto, crítico)
 * - Integration with existing incident response system
 */

import { runOpenAI } from "@/ai/engine";
import { supabase } from "@/integrations/supabase/client";
import { SGSORiskLevel } from "@/types/incident";

export interface IncidentAnalysis {
  probableCause: string;
  suggestedActions: string[];
  riskLevel: SGSORiskLevel;
  preventiveMeasures?: string[];
  complianceReferences?: string[];
  confidence: number;
}

/**
 * Analyze an incident using AI
 */
export const analyzeIncident = async (
  incidentDescription: string,
  additionalContext?: {
    vessel?: string;
    location?: string;
    severity?: string;
    tags?: string[];
  }
): Promise<IncidentAnalysis> => {
  try {
    const contextInfo = additionalContext ? `
Contexto adicional:
- Embarcação: ${additionalContext.vessel || "N/A"}
- Local: ${additionalContext.location || "N/A"}
- Severidade inicial: ${additionalContext.severity || "N/A"}
- Tags: ${additionalContext.tags?.join(", ") || "N/A"}` : "";

    const prompt = `Analise o seguinte incidente marítimo e forneça um diagnóstico detalhado:

DESCRIÇÃO DO INCIDENTE:
${incidentDescription}
${contextInfo}

Forneça sua análise no seguinte formato JSON:
{
  "probableCause": "causa mais provável do incidente (máximo 200 caracteres)",
  "suggestedActions": ["ação 1", "ação 2", "ação 3"],
  "riskLevel": "baixo" | "moderado" | "alto" | "crítico",
  "preventiveMeasures": ["medida preventiva 1", "medida preventiva 2"],
  "complianceReferences": ["referência 1", "referência 2"],
  "confidence": 0.0 a 1.0
}

Critérios para riskLevel:
- baixo: Impacto mínimo, sem risco à segurança
- moderado: Requer atenção, risco controlável
- alto: Risco significativo, ação imediata necessária
- crítico: Risco grave à segurança ou operação`;

    const response = await runOpenAI({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em análise de incidentes marítimos, com conhecimento profundo em normas IMCA, ISM, ISPS e NORMAM. Responda sempre em formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 1500
    });

    // Parse AI response
    const analysis = parseAnalysisResponse(response.content);
    return analysis;
  } catch (error) {
    console.error("Error analyzing incident with AI:", error);
    
    // Fallback analysis
    return generateFallbackAnalysis(incidentDescription, additionalContext);
  }
};

/**
 * Parse AI response and validate structure
 */
const parseAnalysisResponse = (responseText: string): IncidentAnalysis => {
  try {
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and structure the response
    return {
      probableCause: parsed.probableCause || "Causa indeterminada",
      suggestedActions: Array.isArray(parsed.suggestedActions) 
        ? parsed.suggestedActions.slice(0, 5) 
        : ["Investigar causa raiz", "Documentar ocorrência", "Notificar autoridades competentes"],
      riskLevel: validateRiskLevel(parsed.riskLevel),
      preventiveMeasures: Array.isArray(parsed.preventiveMeasures) 
        ? parsed.preventiveMeasures.slice(0, 3)
        : undefined,
      complianceReferences: Array.isArray(parsed.complianceReferences)
        ? parsed.complianceReferences.slice(0, 3)
        : undefined,
      confidence: typeof parsed.confidence === "number" 
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.7
    };
  } catch (error) {
    console.error("Error parsing analysis response:", error);
    throw error;
  }
};

/**
 * Validate risk level value
 */
const validateRiskLevel = (level: any): SGSORiskLevel => {
  const validLevels: SGSORiskLevel[] = ["baixo", "moderado", "alto", "crítico"];
  return validLevels.includes(level) ? level : "moderado";
};

/**
 * Generate fallback analysis when AI is unavailable
 */
const generateFallbackAnalysis = (
  description: string,
  context?: any
): IncidentAnalysis => {
  // Simple keyword-based risk assessment
  const lowerDesc = description.toLowerCase();
  let riskLevel: SGSORiskLevel = "moderado";
  
  if (lowerDesc.includes("crítico") || lowerDesc.includes("grave") || lowerDesc.includes("emergência")) {
    riskLevel = "crítico";
  } else if (lowerDesc.includes("alto") || lowerDesc.includes("urgente") || lowerDesc.includes("falha")) {
    riskLevel = "alto";
  } else if (lowerDesc.includes("baixo") || lowerDesc.includes("menor") || lowerDesc.includes("leve")) {
    riskLevel = "baixo";
  }

  return {
    probableCause: "Análise detalhada requer revisão manual. Configure a chave da API OpenAI para análise automatizada.",
    suggestedActions: [
      "Realizar investigação preliminar",
      "Coletar evidências e depoimentos",
      "Documentar todos os detalhes do incidente",
      "Notificar partes interessadas",
      "Implementar medidas corretivas imediatas se necessário"
    ],
    riskLevel,
    preventiveMeasures: [
      "Revisar procedimentos operacionais",
      "Realizar treinamento adicional da equipe",
      "Implementar verificações preventivas"
    ],
    complianceReferences: [
      "ISM Code 9.1 - Análise de incidentes",
      "IMCA M109 - DP Incident Reporting",
      "NORMAM-01 - Segurança marítima"
    ],
    confidence: 0.5
  };
};

/**
 * Store incident analysis in database
 */
export const storeIncidentAnalysis = async (
  incidentId: string,
  analysis: IncidentAnalysis
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("dp_incidents")
      .update({
        gpt_analysis: JSON.stringify({
          probableCause: analysis.probableCause,
          suggestedActions: analysis.suggestedActions,
          riskLevel: analysis.riskLevel,
          preventiveMeasures: analysis.preventiveMeasures,
          complianceReferences: analysis.complianceReferences,
          confidence: analysis.confidence,
          analyzedAt: new Date().toISOString()
        }),
        sgso_risk_level: analysis.riskLevel
      })
      .eq("id", incidentId);

    if (error) {
      console.error("Error storing incident analysis:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in storeIncidentAnalysis:", error);
    return false;
  }
};

/**
 * Get stored incident analysis
 */
export const getIncidentAnalysis = async (
  incidentId: string
): Promise<IncidentAnalysis | null> => {
  try {
    const { data, error } = await supabase
      .from("dp_incidents")
      .select("gpt_analysis")
      .eq("id", incidentId)
      .single();

    if (error || !data?.gpt_analysis) {
      return null;
    }

    const parsed = typeof data.gpt_analysis === "string" 
      ? JSON.parse(data.gpt_analysis)
      : data.gpt_analysis;

    return parsed as IncidentAnalysis;
  } catch (error) {
    console.error("Error getting incident analysis:", error);
    return null;
  }
};
