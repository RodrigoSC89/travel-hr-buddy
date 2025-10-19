import OpenAI from "openai";
import type { MMIJob } from "@/types/mmi";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, use server-side API
});

interface ForecastResult {
  next_due_date: string
  risk_level: "baixo" | "médio" | "alto"
  reasoning: string
}

export async function generateForecastForJob(job: MMIJob): Promise<ForecastResult> {
  try {
    const system = job.component?.name || job.component_name || "Sistema não especificado";
    const vessel = job.component?.asset?.vessel || "Embarcação não especificada";
    
    const prompt = `
Você é um especialista em manutenção preventiva marítima com foco em análise de risco.

Analise o seguinte job de manutenção:

Título: ${job.title}
Sistema: ${system}
Embarcação: ${vessel}
Status: ${job.status}
Prioridade: ${job.priority}
Data prevista: ${job.due_date}
${job.suggestion_ia ? `Sugestão IA anterior: ${job.suggestion_ia}` : ""}

Por favor, forneça:
1. Próxima data de manutenção recomendada (formato YYYY-MM-DD)
2. Nível de risco (baixo, médio ou alto)
3. Justificativa técnica para a previsão

Responda no formato JSON:
{
  "next_due_date": "YYYY-MM-DD",
  "risk_level": "baixo|médio|alto",
  "reasoning": "justificativa detalhada"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em manutenção preventiva marítima. Responda sempre em português brasileiro com linguagem técnica apropriada. Forneça respostas em formato JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA não contém JSON válido");
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize risk_level
    const normalizedRiskLevel = normalizeRiskLevel(parsedData.risk_level);
    
    return {
      next_due_date: parsedData.next_due_date,
      risk_level: normalizedRiskLevel,
      reasoning: parsedData.reasoning,
    };
  } catch (error) {
    console.error("Erro ao gerar forecast:", error);
    
    // Fallback forecast based on job data
    const fallbackDate = calculateFallbackDate(job.due_date);
    const fallbackRisk = determineFallbackRisk(job.priority);
    
    return {
      next_due_date: fallbackDate,
      risk_level: fallbackRisk,
      reasoning: `Previsão automática baseada na data de vencimento e prioridade do job. ${error instanceof Error ? `Erro: ${error.message}` : ""}`,
    };
  }
}

/**
 * Normalize risk level to accepted values
 */
function normalizeRiskLevel(riskLevel: string): "baixo" | "médio" | "alto" {
  const normalized = riskLevel.toLowerCase().trim();
  
  if (normalized === "baixo" || normalized === "low") return "baixo";
  if (normalized === "alto" || normalized === "high") return "alto";
  return "médio"; // default to médio for medium or unknown values
}

/**
 * Calculate fallback date by adding 30 days to due date
 */
function calculateFallbackDate(dueDate: string): string {
  try {
    const date = new Date(dueDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  } catch {
    // If date parsing fails, return 30 days from now
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  }
}

/**
 * Determine fallback risk based on job priority
 */
function determineFallbackRisk(priority: string): "baixo" | "médio" | "alto" {
  const p = priority.toLowerCase();
  
  if (p === "critical" || p === "high") return "alto";
  if (p === "medium") return "médio";
  return "baixo";
}
