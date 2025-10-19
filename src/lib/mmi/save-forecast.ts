/**
 * MMI Save Forecast
 * Save AI-generated forecasts to Supabase database
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Forecast data structure for database insertion
 */
export type ForecastData = {
  job_id: string;
  system: string;
  next_due_date: string;
  risk_level: "baixo" | "médio" | "alto";
  reasoning: string;
};

/**
 * Save forecast to the mmi_forecasts table in Supabase
 * @param forecast - Forecast data to save
 * @throws Error if save operation fails
 */
export async function saveForecastToDB(forecast: ForecastData): Promise<void> {
  const { error } = await supabase
    .from("mmi_forecasts")
    .insert({
      job_id: forecast.job_id,
      system: forecast.system,
      next_due_date: forecast.next_due_date,
      risk_level: forecast.risk_level,
      reasoning: forecast.reasoning,
    });

  if (error) {
    console.error("Erro ao salvar forecast:", error);
    throw new Error(`Failed to save forecast: ${error.message}`);
  }
}
