/**
 * PATCH 133.0 - AI-based Incident Analyzer
 * PATCH 659 - TypeScript fixes applied
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
import { logger } from "@/lib/logger";

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
    logger.error("Error analyzing incident with AI", error);
    
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
    logger.error("Error parsing analysis response", error);
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
  context?: {
    vessel?: string;
    location?: string;
    severity?: string;
    tags?: string[];
  }
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
 * Store incident analysis (Note: dp_incidents table doesn't have ai_analysis column yet)
 * Consider creating a separate table incident_analyses or adding the column via migration
 */
export const storeIncidentAnalysis = async (
  incidentId: string,
  analysis: IncidentAnalysis
): Promise<boolean> => {
  try {
    // Store analysis in ai_memory table for retrieval
    const memoryContent = {
      incidentId,
      riskLevel: analysis.riskLevel,
      analysis: analysis,
      storedAt: new Date().toISOString()
    };
    
    const { error } = await supabase.from('ai_memory').insert([{
      memory_type: 'incident_analysis',
      content: memoryContent as unknown as import("@/integrations/supabase/types").Json,
      importance: 7
    }]);

    if (error) {
      logger.warn("Failed to store incident analysis", { error, incidentId });
      return false;
    }

    logger.info("Incident analysis stored successfully", { incidentId });
    return true;
  } catch (error) {
    logger.error("Error storing incident analysis", error);
    return false;
  }
};

/**
 * Get stored incident analysis from ai_memory table
 * Uses ai_memory as storage since dp_incidents already has sgso_risk_level
 */
export const getIncidentAnalysis = async (
  incidentId: string
): Promise<IncidentAnalysis | null> => {
  try {
    // Query from ai_memory where incident analysis was stored
    const { data, error } = await supabase
      .from('ai_memory')
      .select('content')
      .eq('memory_type', 'incident_analysis')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      logger.warn("Error fetching incident analyses from ai_memory", { error });
      return null;
    }
    
    // Find the analysis for this specific incident
    const analysisRecord = data?.find((record) => {
      const content = record.content as { incidentId?: string; analysis?: IncidentAnalysis } | null;
      return content?.incidentId === incidentId;
    });
    
    if (!analysisRecord) {
      logger.info("No stored analysis found for incident", { incidentId });
      return null;
    }
    
    const content = analysisRecord.content as { analysis?: IncidentAnalysis } | null;
    return content?.analysis || null;
  } catch (error) {
    logger.error("Error getting incident analysis", error);
    return null;
  }
};
