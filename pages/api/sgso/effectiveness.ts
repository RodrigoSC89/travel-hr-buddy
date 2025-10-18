import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface EffectivenessData {
  category: string;
  incidents_total: number;
  incidents_repeated: number;
  effectiveness_percent: number;
  avg_resolution_days: number | null;
}

interface EffectivenessByVesselData extends EffectivenessData {
  vessel_name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { by_vessel } = req.query;

    if (by_vessel === "true") {
      // Get effectiveness data by vessel
      const { data, error } = await supabase.rpc("calculate_sgso_effectiveness_by_vessel");

      if (error) {
        console.error("Error fetching effectiveness by vessel:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data as EffectivenessByVesselData[]);
    } else {
      // Get overall effectiveness data
      const { data, error } = await supabase.rpc("calculate_sgso_effectiveness");

      if (error) {
        console.error("Error fetching effectiveness data:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data as EffectivenessData[]);
    }
  } catch (error) {
    console.error("Error in effectiveness endpoint:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
