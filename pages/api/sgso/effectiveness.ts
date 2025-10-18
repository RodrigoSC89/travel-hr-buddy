import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EffectivenessMetric {
  category: string;
  total_incidents: number;
  repeated_incidents: number;
  effectiveness_percentage: number;
  avg_resolution_days: number | null;
}

interface EffectivenessByVessel extends EffectivenessMetric {
  vessel_name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { by_vessel } = req.query;
    const byVessel = by_vessel === "true";

    let data: EffectivenessMetric[] | EffectivenessByVessel[];
    let error;

    if (byVessel) {
      // Get effectiveness by vessel
      const result = await supabase.rpc("calculate_sgso_effectiveness_by_vessel");
      data = result.data || [];
      error = result.error;
    } else {
      // Get general effectiveness
      const result = await supabase.rpc("calculate_sgso_effectiveness");
      data = result.data || [];
      error = result.error;
    }

    if (error) {
      console.error("Error fetching SGSO effectiveness:", error);
      return res.status(500).json({ 
        error: "Failed to fetch effectiveness data",
        details: error.message 
      });
    }

    // Calculate summary statistics
    const totalIncidents = data.reduce((sum, item) => sum + Number(item.total_incidents), 0);
    const totalRepeated = data.reduce((sum, item) => sum + Number(item.repeated_incidents), 0);
    const overallEffectiveness = totalIncidents > 0 
      ? Number((100 - (totalRepeated / totalIncidents * 100)).toFixed(2))
      : 0;

    return res.status(200).json({
      data,
      summary: {
        total_incidents: totalIncidents,
        total_repeated: totalRepeated,
        overall_effectiveness: overallEffectiveness,
      },
    });
  } catch (error) {
    console.error("Unexpected error in effectiveness API:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
