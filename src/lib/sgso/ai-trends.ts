/**
 * SGSO AI Trends Analysis
 * AI-powered analysis of SGSO action plans trends using GPT-4
 */

import { openai } from "@/lib/openai";
import { SGSOActionPlan } from "./export-utils";

export interface SGSOTrendsAnalysis {
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  mainRootCauses: Array<{ cause: string; occurrences: number }>;
  systemicMeasures: string[];
  emergingRisks: string[];
  summary: string;
  generatedAt: string;
}

/**
 * Summarize SGSO tendencies with AI
 * Analyzes action plans and generates insights about trends, root causes, and recommendations
 * @param plans - Array of action plans to analyze
 * @returns AI-generated analysis
 */
export async function summarizeSGSOTendenciesWithAI(
  plans: SGSOActionPlan[]
): Promise<SGSOTrendsAnalysis> {
  if (!plans || plans.length === 0) {
    throw new Error("Nenhum plano de ação fornecido para análise");
  }

  // Serialize plans for AI analysis
  const serialized = plans
    .map(
      (p) => `
- Incidente: ${p.dp_incidents?.title || p.incident_id}
- Categoria: ${p.dp_incidents?.sgso_category || "N/A"}
- Causa raiz: ${p.dp_incidents?.sgso_root_cause || p.dp_incidents?.root_cause || "N/A"}
- Embarcação: ${p.dp_incidents?.vessel || "N/A"}
- Ação Corretiva: ${p.corrective_action}
- Ação Preventiva: ${p.preventive_action}
- Recomendação: ${p.recommendation || "N/A"}
`
    )
    .join("\n");

  const prompt = `
Você é um auditor de segurança marítima especializado em SGSO (Sistema de Gestão de Segurança Operacional) e incidentes de Dynamic Positioning (DP).

A partir dos seguintes incidentes e planos SGSO, gere uma análise estruturada em formato JSON com:

1. Top 3 categorias mais frequentes (com contagem e percentual)
2. Principais causas raiz (liste as 5 mais comuns com número de ocorrências)
3. Medidas sistêmicas sugeridas (5 recomendações preventivas)
4. Riscos emergentes detectados (3-5 riscos potenciais identificados nos dados)
5. Resumo executivo (parágrafo de 3-4 linhas)

Retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "topCategories": [
    { "category": "nome da categoria", "count": número, "percentage": percentual }
  ],
  "mainRootCauses": [
    { "cause": "descrição da causa", "occurrences": número }
  ],
  "systemicMeasures": [
    "medida preventiva 1",
    "medida preventiva 2",
    ...
  ],
  "emergingRisks": [
    "risco emergente 1",
    "risco emergente 2",
    ...
  ],
  "summary": "resumo executivo em 3-4 linhas"
}

Base de dados (${plans.length} planos de ação):
${serialized}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da API OpenAI");
    }

    // Parse JSON response
    const analysis = JSON.parse(content);

    // Add generation timestamp
    return {
      ...analysis,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao gerar análise de tendências SGSO:", error);
    
    // Return fallback analysis if AI fails
    return generateFallbackAnalysis(plans);
  }
}

/**
 * Generate fallback analysis without AI
 * Used when OpenAI API is unavailable or fails
 */
function generateFallbackAnalysis(plans: SGSOActionPlan[]): SGSOTrendsAnalysis {
  // Count categories
  const categoryMap = new Map<string, number>();
  const rootCauseMap = new Map<string, number>();

  plans.forEach((plan) => {
    const category = plan.dp_incidents?.sgso_category || "Não categorizado";
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);

    const rootCause = plan.dp_incidents?.sgso_root_cause || plan.dp_incidents?.root_cause || "Não identificado";
    rootCauseMap.set(rootCause, (rootCauseMap.get(rootCause) || 0) + 1);
  });

  // Get top categories
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / plans.length) * 100),
    }));

  // Get main root causes
  const mainRootCauses = Array.from(rootCauseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cause, occurrences]) => ({
      cause,
      occurrences,
    }));

  return {
    topCategories,
    mainRootCauses,
    systemicMeasures: [
      "Implementar revisões periódicas dos procedimentos operacionais",
      "Reforçar programa de treinamento para operadores DP",
      "Estabelecer sistema de monitoramento contínuo de equipamentos críticos",
      "Criar programa de auditoria interna mais frequente",
      "Desenvolver cultura de reporte proativo de quase-acidentes",
    ],
    emergingRisks: [
      "Fadiga operacional em períodos de alta demanda",
      "Degradação de equipamentos críticos não detectada",
      "Lacunas na comunicação entre turmas",
    ],
    summary: `Análise de ${plans.length} planos de ação SGSO. As categorias mais frequentes representam ${topCategories[0]?.percentage || 0}% dos incidentes. Recomenda-se atenção especial às causas raiz identificadas e implementação das medidas preventivas sistêmicas.`,
    generatedAt: new Date().toISOString(),
  };
}
