/**
 * MMI Forecast Storage Service
 * Handles saving forecasts to the database
 */

import { createClient } from "@/lib/supabase/client";
import type { AIForecast } from "@/types/mmi";

export interface SaveForecastInput {
  vessel_id?: string;
  vessel_name: string;
  system_name: string;
  hourmeter: number;
  last_maintenance: string[];
  forecast_text: string;
  priority?: string;
}

/**
 * Save a forecast to the database
 */
export async function saveForecast(input: SaveForecastInput) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("mmi_forecasts")
      .insert({
        vessel_id: input.vessel_id,
        vessel_name: input.vessel_name,
        system_name: input.system_name,
        hourmeter: input.hourmeter,
        last_maintenance: input.last_maintenance,
        forecast_text: input.forecast_text,
        priority: input.priority || "medium",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving forecast:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to save forecast:", error);
    throw error;
  }
}

/**
 * Convert AIForecast to a formatted text for storage
 */
export function formatForecastText(forecast: AIForecast): string {
  return `
📋 Próxima Intervenção:
${forecast.next_intervention}

🔍 Justificativa:
${forecast.reasoning}

⚠️ Impacto se Não Executar:
${forecast.impact}

🎯 Prioridade: ${forecast.priority.toUpperCase()}
📅 Data Sugerida: ${new Date(forecast.suggested_date).toLocaleDateString("pt-BR")}
⏱ Horímetro Atual: ${forecast.hourometer_current}h

📊 Histórico de Manutenções:
${forecast.maintenance_history.map((h) => `- ${h.date}: ${h.action}`).join("\n")}
`.trim();
}
