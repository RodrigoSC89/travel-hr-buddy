import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Type definitions for effectiveness data
export interface EffectivenessData {
  category: string;
  incidents_total: number;
  incidents_repeated: number;
  effectiveness_percent: number;
  avg_resolution_days: number;
}

export interface EffectivenessDataByVessel extends EffectivenessData {
  vessel: string;
}

interface ErrorResponse {
  error: string;
}

type EffectivenessResponse = EffectivenessData[] | EffectivenessDataByVessel[] | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EffectivenessResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Supabase configuration is missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we need vessel-specific data
    const byVessel = req.query.by_vessel === "true";

    if (byVessel) {
      // Get effectiveness data by vessel
      const { data, error } = await supabase.rpc("calculate_sgso_effectiveness_by_vessel");

      if (error) {
        console.error("Error fetching effectiveness data by vessel:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    } else {
      // Get overall effectiveness data
      const { data, error } = await supabase.rpc("calculate_sgso_effectiveness");

      if (error) {
        console.error("Error fetching effectiveness data:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    }
  } catch (error) {
    console.error("Unexpected error in effectiveness API:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    });
  }
}
