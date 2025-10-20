/**
 * MMI Forecast IA
 * AI-powered maintenance forecast using GPT-4
 */

import { openai } from "@/lib/ai/openai-client";

export type MMIJob = {
  id: string;
  title?: string;
  system?: string;
  lastExecuted?: string | null;
  frequencyDays?: number;
  observations?: string;
  component?: {
    name?: string;
    current_hours?: number;
    maintenance_interval_hours?: number;
    asset?: {
      name?: string;
      vessel?: string;
    };
  };
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
};

export type ForecastResult = {
  next_due_date: string;
  risk_level: "baixo" | "médio" | "alto";
  reasoning: string;
};

/**
 * Generate intelligent forecast for a maintenance job using GPT-4
 * @param job - MMI job data including history and frequency
 * @returns Forecast with next due date, risk level, and reasoning
 */
export async function generateForecastForJob(job: MMIJob): Promise<ForecastResult> {
  // Safe defaults for all job fields
  const safeTitle = job.title ?? job.component?.name ?? "Título não informado";
  const safeSystem = job.system ?? "Sistema não especificado";
  const safeDescription = job.description ?? "não informada";
  const safeStatus = job.status ?? "pending";
  const safePriority = job.priority ?? "medium";
  const safeDueDate = job.due_date ?? "não definida";
  const safeFrequencyDays = job.frequencyDays ?? 30;
  
  // Safe component access with optional chaining
  const componentInfo = job.component?.name ?? "Componente não especificado";
  const assetName = job.component?.asset?.name ?? "Ativo não especificado";
  const vesselName = job.component?.asset?.vessel ?? "Embarcação não especificada";
  const currentHours = job.component?.current_hours != null 
    ? `${job.component.current_hours} horas` 
    : "não informado";
  const intervalHours = job.component?.maintenance_interval_hours != null 
    ? `${job.component.maintenance_interval_hours} horas` 
    : "não informado";

  const prompt = `
Você é um assistente de manutenção inteligente.
Recebe dados sobre um job de manutenção técnica.

Retorne:
- Previsão de próxima data de execução (formato ISO)
- Risco (baixo, médio, alto) caso não seja feito a tempo
- Justificativa técnica da previsão (máximo 300 caracteres)

Dados do job:
- ID: ${job.id}
- Título: ${safeTitle}
- Sistema: ${safeSystem}
- Descrição: ${safeDescription}
- Status: ${safeStatus}
- Prioridade: ${safePriority}
- Data prevista: ${safeDueDate}
- Última execução: ${job.lastExecuted || "desconhecida"}
- Frequência esperada: ${safeFrequencyDays} dias
- Observações: ${job.observations || "nenhuma"}
- Componente: ${componentInfo}
- Ativo: ${assetName}
- Embarcação: ${vesselName}
- Horas atuais: ${currentHours}
- Intervalo de manutenção: ${intervalHours}

Responda em JSON:
{
  "next_due_date": "...",
  "risk_level": "...",
  "reasoning": "..."
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content || "{}";
    return JSON.parse(raw);
  } catch (error) {
    // Fallback: calculate next due date based on frequency
    const fallbackDate = new Date(Date.now() + safeFrequencyDays * 24 * 60 * 60 * 1000);
    const next_due_date = fallbackDate.toISOString().split('T')[0];
    
    // Map priority to risk level
    const risk_level: "baixo" | "médio" | "alto" = 
      safePriority === "critical" || safePriority === "high" ? "alto" :
      safePriority === "low" ? "baixo" : "médio";
    
    const reasoning = `Previsão gerada automaticamente com base na prioridade ${safePriority} do job. ${safeDescription ?? safeTitle}`;
    
    return { next_due_date, risk_level, reasoning };
  }
}
