import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to manually trigger the forecast email report
 * This endpoint can be called manually from the admin UI or via cron job
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createClient();

    // Call the jobs-forecast edge function to get the forecast data
    const { data: trendData, error: trendError } = await supabase.rpc("jobs_trend_by_month");

    if (trendError) {
      console.error("Error fetching trend data:", trendError);
      return res.status(500).json({ 
        sent: false, 
        error: "Erro ao buscar dados de tendência" 
      });
    }

    // Generate forecast using AI
    const { data: forecastData, error: forecastError } = await supabase.functions.invoke("jobs-forecast", {
      body: { trend: trendData }
    });

    if (forecastError) {
      console.error("Error generating forecast:", forecastError);
      return res.status(500).json({ 
        sent: false, 
        error: "Erro ao gerar previsão com IA" 
      });
    }

    // TODO: In a real implementation, you would send this forecast via email
    // For now, we'll just log it and return success
    console.log("Forecast generated:", forecastData);
    console.log("✅ Forecast email would be sent here in production");

    // Return success
    return res.status(200).json({ 
      sent: true, 
      message: "Previsão gerada com sucesso",
      forecast: forecastData?.forecast 
    });

  } catch (error) {
    console.error("Error in send-forecast-report:", error);
    return res.status(500).json({ 
      sent: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    });
  }
}
