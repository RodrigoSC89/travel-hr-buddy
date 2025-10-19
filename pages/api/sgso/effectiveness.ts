import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type {
  SGSOEffectivenessByCategory,
  SGSOEffectivenessByVessel,
  SGSOEffectivenessSummary,
} from "@/types/sgso-effectiveness";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Fetch effectiveness data by category
    const { data: categoryData, error: categoryError } = await supabase.rpc(
      "calculate_sgso_effectiveness_by_category"
    );

    if (categoryError) {
      console.error("Error fetching category effectiveness:", categoryError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch effectiveness data by category",
      });
    }

    // Fetch effectiveness data by vessel
    const { data: vesselData, error: vesselError } = await supabase.rpc(
      "calculate_sgso_effectiveness_by_vessel"
    );

    if (vesselError) {
      console.error("Error fetching vessel effectiveness:", vesselError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch effectiveness data by vessel",
      });
    }

    // Calculate summary metrics
    const byCategory = (categoryData || []) as SGSOEffectivenessByCategory[];
    const byVessel = (vesselData || []) as SGSOEffectivenessByVessel[];

    const totalIncidents = byCategory.reduce(
      (sum, item) => sum + Number(item.total_incidents),
      0
    );
    const totalRepeated = byCategory.reduce(
      (sum, item) => sum + Number(item.repeated_incidents),
      0
    );

    const overallEffectiveness =
      totalIncidents > 0
        ? Number((100 - (totalRepeated / totalIncidents) * 100).toFixed(2))
        : 0;

    // Calculate weighted average resolution time
    let totalResolutionDays = 0;
    let totalResolved = 0;

    byCategory.forEach((item) => {
      if (item.avg_resolution_days !== null) {
        const resolvedCount = Number(item.total_incidents) - Number(item.repeated_incidents);
        totalResolutionDays += Number(item.avg_resolution_days) * resolvedCount;
        totalResolved += resolvedCount;
      }
    });

    const avgResolutionTime =
      totalResolved > 0
        ? Number((totalResolutionDays / totalResolved).toFixed(2))
        : null;

    const summary: SGSOEffectivenessSummary = {
      total_incidents: totalIncidents,
      total_repeated: totalRepeated,
      overall_effectiveness: overallEffectiveness,
      avg_resolution_time: avgResolutionTime,
      by_category: byCategory,
      by_vessel: byVessel,
    };

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error in SGSO effectiveness endpoint:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
