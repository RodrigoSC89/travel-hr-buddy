/**
 * MMI Forecast IA
 * AI-powered maintenance forecast using GPT-4
 */

import { openai } from "@/lib/ai/openai-client";

export type MMIJob = {
  id: string;
  title: string;
  system: string;
  lastExecuted: string | null;
  frequencyDays: number;
  observations?: string;
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
  const prompt = `
Você é um assistente de manutenção inteligente.
Recebe dados sobre um job de manutenção técnica.

Retorne:
- Previsão de próxima data de execução (formato ISO)
- Risco (baixo, médio, alto) caso não seja feito a tempo
- Justificativa técnica da previsão (máximo 300 caracteres)

Dados do job:
- ID: ${job.id}
- Título: ${job.title}
- Sistema: ${job.system}
- Última execução: ${job.lastExecuted || "desconhecida"}
- Frequência esperada: ${job.frequencyDays} dias
- Observações: ${job.observations || "nenhuma"}

Responda em JSON:
{
  "next_due_date": "...",
  "risk_level": "...",
  "reasoning": "..."
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const raw = completion.choices[0].message.content || "{}";
  return JSON.parse(raw);
}
