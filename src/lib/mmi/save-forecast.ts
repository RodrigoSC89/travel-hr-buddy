import { createBrowserClient } from "@supabase/ssr";

type Forecast = {
  job_id: string
  system: string
  next_due_date: string
  risk_level: "baixo" | "médio" | "alto"
  reasoning: string
}

export async function saveForecastToDB(forecast: Forecast) {
  const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  const { error } = await supabase.from("mmi_forecasts").insert(forecast);

  if (error) {
    console.error("Erro ao salvar forecast:", error);
    throw new Error(error.message);
  }
}
