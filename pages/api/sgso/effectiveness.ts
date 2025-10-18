import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type {
  SGSOEffectiveness,
  SGSOEffectivenessByVessel,
  SGSOEffectivenessSummary,
  SGSOEffectivenessResponse,
} from "@/types/sgso-effectiveness";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SGSOEffectivenessResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { by_vessel } = req.query;
    const byVessel = by_vessel === "true";

    if (byVessel) {
      return handleGetByVessel(req, res);
    } else {
      return handleGetByCategory(req, res);
    }
  } catch (error) {
    console.error("Error in GET /api/sgso/effectiveness:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetByCategory(
  req: NextApiRequest,
  res: NextApiResponse<SGSOEffectivenessResponse | { error: string }>
) {
  try {
    const { data, error } = await supabase.rpc("calculate_sgso_effectiveness");

    if (error) {
      console.error("Error calling calculate_sgso_effectiveness:", error);
      return res.status(500).json({ error: error.message });
    }

    const effectiveness = (data || []) as SGSOEffectiveness[];

    // Calculate summary
    const summary = calculateSummary(effectiveness);

    return res.status(200).json({
      data: effectiveness,
      summary,
      by_vessel: false,
    });
  } catch (error) {
    console.error("Error in handleGetByCategory:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetByVessel(
  req: NextApiRequest,
  res: NextApiResponse<SGSOEffectivenessResponse | { error: string }>
) {
  try {
    const { data, error } = await supabase.rpc(
      "calculate_sgso_effectiveness_by_vessel"
    );

    if (error) {
      console.error("Error calling calculate_sgso_effectiveness_by_vessel:", error);
      return res.status(500).json({ error: error.message });
    }

    const effectiveness = (data || []) as SGSOEffectivenessByVessel[];

    // Calculate summary
    const summary = calculateSummaryByVessel(effectiveness);

    return res.status(200).json({
      data: effectiveness,
      summary,
      by_vessel: true,
    });
  } catch (error) {
    console.error("Error in handleGetByVessel:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function calculateSummary(
  data: SGSOEffectiveness[]
): SGSOEffectivenessSummary {
  const totalIncidents = data.reduce((sum, item) => sum + item.total_incidents, 0);
  const totalRepeated = data.reduce((sum, item) => sum + item.repeated_incidents, 0);
  const overallEffectiveness = totalIncidents > 0 
    ? parseFloat((100 - (totalRepeated / totalIncidents * 100)).toFixed(2))
    : 0;
  
  // Calculate weighted average resolution time
  const totalResolutionDays = data.reduce(
    (sum, item) => sum + (item.avg_resolution_days || 0) * item.total_incidents,
    0
  );
  const avgResolutionTime = totalIncidents > 0 
    ? parseFloat((totalResolutionDays / totalIncidents).toFixed(2))
    : 0;

  return {
    total_incidents: totalIncidents,
    total_repeated: totalRepeated,
    overall_effectiveness: overallEffectiveness,
    avg_resolution_time: avgResolutionTime,
  };
}

function calculateSummaryByVessel(
  data: SGSOEffectivenessByVessel[]
): SGSOEffectivenessSummary {
  const totalIncidents = data.reduce((sum, item) => sum + item.total_incidents, 0);
  const totalRepeated = data.reduce((sum, item) => sum + item.repeated_incidents, 0);
  const overallEffectiveness = totalIncidents > 0 
    ? parseFloat((100 - (totalRepeated / totalIncidents * 100)).toFixed(2))
    : 0;
  
  // Calculate weighted average resolution time
  const totalResolutionDays = data.reduce(
    (sum, item) => sum + (item.avg_resolution_days || 0) * item.total_incidents,
    0
  );
  const avgResolutionTime = totalIncidents > 0 
    ? parseFloat((totalResolutionDays / totalIncidents).toFixed(2))
    : 0;

  return {
    total_incidents: totalIncidents,
    total_repeated: totalRepeated,
    overall_effectiveness: overallEffectiveness,
    avg_resolution_time: avgResolutionTime,
  };
}
