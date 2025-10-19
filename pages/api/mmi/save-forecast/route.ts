import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

interface SaveForecastRequest {
  vessel_name: string;
  system_name: string;
  hourmeter: number;
  last_maintenance: string[];
  forecast_text: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Auth error:", authError);
    }

    const body: SaveForecastRequest = req.body;
    const {
      vessel_name,
      system_name,
      hourmeter,
      last_maintenance,
      forecast_text,
    } = body;

    // Validate required fields
    if (!vessel_name || !system_name || hourmeter === undefined || !last_maintenance || !forecast_text) {
      return res.status(400).json({
        error: "Missing required fields: vessel_name, system_name, hourmeter, last_maintenance, forecast_text",
      });
    }

    // Insert forecast into database
    const { error: insertError } = await supabase.from("mmi_forecasts").insert([
      {
        vessel_name,
        system_name,
        hourmeter,
        last_maintenance,
        forecast_text,
        created_by: user?.id || null,
      },
    ]);

    if (insertError) {
      console.error("Database error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error("Error saving forecast:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to save forecast",
      details: errorMessage,
    });
  }
}
