/**
 * ISM Audit Assistant - LLM Integration
 * PATCH-609: AI-powered audit analysis
 */

import { nautilusRespond } from "../ai/nautilusLLM";
import type { ISMAuditItem, ComplianceStatus } from "../../types/ism-audit";

export interface AnalyzeISMItemParams {
  question: string;
  response: string;
  evidence?: string;
  category?: string;
}

export interface ISMAnalysisResult {
  compliant: ComplianceStatus;
  explanation: string;
  recommendations: string[];
  confidence: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

/**
 * Analyze a single ISM audit item using LLM
 */
export async function analyzeISMItem(params: AnalyzeISMItemParams): Promise<ISMAnalysisResult> {
  const { question, response, evidence, category } = params;
  
  const prompt = `
Você é um auditor marítimo especializado em ISM (International Safety Management).

CATEGORIA: ${category || "Geral"}
PERGUNTA DA AUDITORIA: ${question}
RESPOSTA FORNECIDA: ${response}
${evidence ? `EVIDÊNCIA: ${evidence}` : ""}

Avalie esta resposta considerando:
1. Conformidade com requisitos ISM
2. Completude da resposta
3. Evidências apresentadas
4. Riscos potenciais

Forneça sua análise no seguinte formato JSON:
{
  "compliant": "compliant|non-compliant|not-applicable",
  "explanation": "Explicação clara e detalhada da avaliação",
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "confidence": 0.0-1.0,
  "riskLevel": "low|medium|high|critical"
}

Seja objetivo, técnico e foque na conformidade com padrões ISM.
`;

  try {
    const result = await nautilusRespond({
      prompt,
      mode: "safe",
      contextId: "ism-audit-analysis"
    });
    
    // Try to parse JSON from response
    const jsonMatch = result.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        compliant: analysis.compliant || "pending",
        explanation: analysis.explanation || result.response,
        recommendations: analysis.recommendations || [],
        confidence: analysis.confidence || result.confidenceScore || 0.7,
        riskLevel: analysis.riskLevel || "medium"
      };
    }
    
    // Fallback if JSON parsing fails
    return {
      compliant: "pending",
      explanation: result.response,
      recommendations: [],
      confidence: result.confidenceScore || 0.7,
      riskLevel: "medium"
    };
  } catch (error) {
    console.error("Error analyzing ISM item:", error);
    throw new Error("Failed to analyze audit item with AI");
  }
}

/**
 * Generate audit summary using LLM
 */
export async function generateAuditSummary(
  items: ISMAuditItem[],
  vesselName: string,
  auditType: string
): Promise<string> {
  const compliantCount = items.filter(i => i.compliant === "compliant").length;
  const nonCompliantCount = items.filter(i => i.compliant === "non-compliant").length;
  const totalApplicable = items.filter(i => i.compliant !== "not-applicable").length;
  
  const nonCompliantItems = items
    .filter(i => i.compliant === "non-compliant")
    .map(i => `- ${i.category}: ${i.question}`)
    .join("\n");
  
  const prompt = `
Você é um auditor marítimo gerando um sumário executivo de auditoria ISM.

EMBARCAÇÃO: ${vesselName}
TIPO DE AUDITORIA: ${auditType}
ITENS AVALIADOS: ${totalApplicable}
ITENS CONFORMES: ${compliantCount}
ITENS NÃO-CONFORMES: ${nonCompliantCount}

ITENS NÃO-CONFORMES IDENTIFICADOS:
${nonCompliantItems || "Nenhum"}

Gere um sumário executivo profissional que inclua:
1. Avaliação geral da conformidade
2. Principais achados
3. Áreas de preocupação
4. Recomendações prioritárias

Seja conciso, profissional e objetivo. Máximo 500 palavras.
`;

  try {
    const result = await nautilusRespond({
      prompt,
      mode: "safe",
      contextId: "ism-audit-summary"
    });
    
    return result.response;
  } catch (error) {
    console.error("Error generating audit summary:", error);
    return "Erro ao gerar sumário da auditoria.";
  }
}

/**
 * Suggest improvements based on audit results
 */
export async function suggestImprovements(
  nonCompliantItems: ISMAuditItem[]
): Promise<string[]> {
  if (nonCompliantItems.length === 0) {
    return ["Todas as áreas estão em conformidade. Continue mantendo os padrões."];
  }
  
  const itemsList = nonCompliantItems
    .map(i => `${i.category}: ${i.question}`)
    .join("\n");
  
  const prompt = `
Com base nos seguintes itens não-conformes em uma auditoria ISM:

${itemsList}

Liste 5 ações corretivas prioritárias e específicas.
Formate como lista simples, uma por linha, iniciando com "- ".
`;

  try {
    const result = await nautilusRespond({
      prompt,
      mode: "safe",
      contextId: "ism-improvements"
    });
    
    // Extract list items
    const suggestions = result.response
      .split("\n")
      .filter(line => line.trim().startsWith("-"))
      .map(line => line.replace(/^-\s*/, "").trim())
      .filter(line => line.length > 0);
    
    return suggestions.length > 0 ? suggestions : [result.response];
  } catch (error) {
    console.error("Error suggesting improvements:", error);
    return ["Erro ao gerar sugestões de melhoria."];
  }
}
