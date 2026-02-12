/**
 * MMI Forecast Service
 * Routes through secure edge function proxy - NO browser-side API keys
 */

import type { AIForecast, MMIComponent, MMIHistory } from "@/types/mmi";
import { logger } from "@/lib/logger";
import { chatCompletionJSON } from "@/services/unified/openai-client.service";

interface ForecastInput {
  system_name: string;
  component: MMIComponent;
  maintenance_history: MMIHistory[];
}

/**
 * Generate AI forecast for a component based on its hourometer and history
 */
export async function generateForecast(input: ForecastInput): Promise<AIForecast> {
  try {
    const { system_name, component, maintenance_history } = input;
    const progressPercentage = (component.current_hours / component.maintenance_interval_hours) * 100;
    const hoursUntilMaintenance = component.maintenance_interval_hours - component.current_hours;

    const historyText = maintenance_history
      .slice(0, 5)
      .map((h) => `- ${h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "Data não registrada"} (${h.task_description})`)
      .join("\n");

    const result = await chatCompletionJSON<{
      next_intervention: string;
      reasoning: string;
      impact: string;
      priority: string;
      suggested_date: string;
    }>(
      [
        {
          role: "system",
          content: "Você é um especialista em manutenção preventiva de sistemas náuticos. Responda sempre em português brasileiro com linguagem técnica apropriada.",
        },
        {
          role: "user",
          content: `Sistema: ${system_name}
Componente: ${component.component_name}
Tipo: ${component.component_type || "Não especificado"}
Fabricante: ${component.manufacturer || "Não especificado"}
Horímetro atual: ${component.current_hours}h
Intervalo de manutenção: ${component.maintenance_interval_hours}h
Progresso: ${progressPercentage.toFixed(1)}%
Horas até manutenção: ${hoursUntilMaintenance.toFixed(1)}h
Últimas manutenções:
${historyText || "Nenhum histórico disponível"}

Forneça JSON: { "next_intervention": "...", "reasoning": "...", "impact": "...", "priority": "low|medium|high|critical", "suggested_date": "YYYY-MM-DD" }`,
        },
      ],
      { temperature: 0.7, maxTokens: 1000, responseFormat: "json" }
    );

    if (result) {
      return {
        next_intervention: result.next_intervention,
        reasoning: result.reasoning,
        impact: result.impact,
        priority: result.priority as "low" | "medium" | "high" | "critical",
        suggested_date: result.suggested_date,
        hourometer_current: component.current_hours,
        maintenance_history: maintenance_history.slice(0, 5).map((h) => ({
          date: h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "N/A",
          action: h.task_description ?? "Manutenção realizada",
        })),
      };
    }

    // Fallback when AI is unavailable
    return createFallbackForecast(input);
  } catch (error) {
    logger.error("Error generating forecast", error as Error, { componentName: input.component.component_name });
    return createFallbackForecast(input);
  }
}

function createFallbackForecast(input: ForecastInput): AIForecast {
  const progress = (input.component.current_hours / input.component.maintenance_interval_hours) * 100;
  return {
    next_intervention: `Manutenção preventiva de ${input.component.component_name}`,
    reasoning: `Componente atingiu ${progress.toFixed(1)}% do intervalo de manutenção`,
    impact: "Execução da manutenção preventiva conforme programação para garantir operação segura",
    priority: determinePriority(progress),
    suggested_date: calculateSuggestedDate(input.component.maintenance_interval_hours - input.component.current_hours),
    hourometer_current: input.component.current_hours,
    maintenance_history: input.maintenance_history.slice(0, 5).map((h) => ({
      date: h.executed_at ? new Date(h.executed_at).toLocaleDateString("pt-BR") : "N/A",
      action: h.task_description ?? "Manutenção realizada",
    })),
  };
}

function determinePriority(progressPercentage: number): "low" | "medium" | "high" | "critical" {
  if (progressPercentage >= 100) return "critical";
  if (progressPercentage >= 95) return "high";
  if (progressPercentage >= 80) return "medium";
  return "low";
}

function calculateSuggestedDate(hoursUntilMaintenance: number): string {
  const daysUntilMaintenance = Math.max(1, Math.floor(hoursUntilMaintenance / 8));
  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + daysUntilMaintenance);
  return suggestedDate.toISOString().split("T")[0];
}
