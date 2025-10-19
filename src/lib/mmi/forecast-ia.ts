/**
 * MMI Forecast IA
 * AI-powered maintenance forecast using GPT-4
 */

import { openai } from "@/lib/ai/openai-client";

/**
 * MMI Job structure matching the database schema
 * Includes component and asset information for comprehensive forecasting
 */
export type MMIJob = {
  id: string;
  title: string;
  description?: string;
  component: {
    name: string;
    current_hours?: number;
    maintenance_interval_hours?: number;
    asset?: {
      name: string;
      vessel?: string;
    };
  };
  status: "pending" | "in_progress" | "completed" | "cancelled" | "postponed";
  priority: "critical" | "high" | "medium" | "low";
  due_date?: string;
  completed_date?: string;
  metadata?: Record<string, any>;
};

/**
 * Forecast result structure for database persistence
 */
export type ForecastResult = {
  next_due_date: string;
  risk_level: "baixo" | "médio" | "alto";
  reasoning: string;
};

/**
 * Map job priority to risk level
 * Critical/High priority jobs are considered high risk
 */
function mapPriorityToRisk(priority: MMIJob["priority"]): ForecastResult["risk_level"] {
  switch (priority) {
    case "critical":
    case "high":
      return "alto";
    case "medium":
      return "médio";
    case "low":
      return "baixo";
    default:
      return "médio";
  }
}

/**
 * Generate intelligent forecast for a maintenance job using GPT-4
 * @param job - MMI job data including component and asset information
 * @returns Forecast with next due date, risk level, and reasoning
 */
export async function generateForecastForJob(job: MMIJob): Promise<ForecastResult> {
  // Build detailed context for AI analysis
  const componentInfo = job.component.name || "Componente não especificado";
  const assetName = job.component.asset?.name || "Ativo não especificado";
  const vesselName = job.component.asset?.vessel || "Embarcação não especificada";
  const currentHours = job.component.current_hours 
    ? `${job.component.current_hours} horas`
    : "não informado";
  const intervalHours = job.component.maintenance_interval_hours
    ? `${job.component.maintenance_interval_hours} horas`
    : "não informado";

  const prompt = `
Você é um assistente de manutenção marítima inteligente.
Analise os dados abaixo e gere uma previsão de manutenção.

Dados do Job:
- ID: ${job.id}
- Título: ${job.title}
- Descrição: ${job.description || "não informada"}
- Status: ${job.status}
- Prioridade: ${job.priority}
- Data prevista: ${job.due_date || "não definida"}

Dados do Componente:
- Nome: ${componentInfo}
- Horímetro atual: ${currentHours}
- Intervalo de manutenção: ${intervalHours}

Dados do Ativo:
- Nome do Ativo: ${assetName}
- Embarcação: ${vesselName}

Metadados adicionais:
${job.metadata ? JSON.stringify(job.metadata, null, 2) : "nenhum"}

Retorne em JSON (estritamente este formato):
{
  "next_due_date": "YYYY-MM-DD (data prevista para próxima manutenção)",
  "risk_level": "baixo|médio|alto (avalie o risco se não for realizado a tempo)",
  "reasoning": "Justificativa técnica da previsão em português (máximo 300 caracteres)"
}

Considere:
- Prioridade do job ao avaliar risco
- Horímetro e intervalo de manutenção
- Criticidade do componente para operação do ativo
- Conformidade com normas NORMAM/SOLAS se aplicável
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content || "{}";
    const forecast = JSON.parse(raw) as ForecastResult;

    // Validate and ensure proper format
    if (!forecast.next_due_date || !forecast.risk_level || !forecast.reasoning) {
      throw new Error("Invalid forecast response from AI");
    }

    // Ensure risk_level is one of the valid values
    if (!["baixo", "médio", "alto"].includes(forecast.risk_level)) {
      forecast.risk_level = mapPriorityToRisk(job.priority);
    }

    return forecast;
  } catch (error) {
    console.error("Error generating forecast with AI:", error);
    
    // Fallback forecast based on job priority and due date
    const riskLevel = mapPriorityToRisk(job.priority);
    const nextDueDate = job.due_date || calculateDefaultDueDate();
    
    return {
      next_due_date: nextDueDate,
      risk_level: riskLevel,
      reasoning: `Previsão gerada automaticamente com base na prioridade ${job.priority} do job. ${job.description || job.title}`,
    };
  }
}

/**
 * Calculate a default due date when AI fails
 * Returns 30 days from now in ISO format
 */
function calculateDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}
