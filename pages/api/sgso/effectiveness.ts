import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SGSOEffectivenessData {
  categoria: string;
  total_incidencias: number;
  incidencias_repetidas: number;
  efetividade: number;
  tempo_medio_resolucao: number | null;
}

export interface SGSOEffectivenessByVesselData {
  embarcacao: string;
  categoria: string;
  total_incidencias: number;
  incidencias_repetidas: number;
  efetividade: number;
  tempo_medio_resolucao: number | null;
}

/**
 * GET /api/sgso/effectiveness
 * 
 * Returns SGSO effectiveness metrics for action plans
 * 
 * Query Parameters:
 * - by_vessel: boolean - If true, returns data grouped by vessel
 * 
 * Responses:
 * - 200: Success with effectiveness data
 * - 405: Method not allowed
 * - 500: Internal server error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { by_vessel } = req.query;
    const groupByVessel = by_vessel === "true";

    if (groupByVessel) {
      // Get effectiveness data grouped by vessel and category
      const { data, error } = await supabase.rpc(
        "calculate_sgso_effectiveness_by_vessel"
      );

      if (error) {
        console.error("Error fetching SGSO effectiveness by vessel:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    } else {
      // Get overall effectiveness data by category
      const { data, error } = await supabase.rpc(
        "calculate_sgso_effectiveness"
      );

      if (error) {
        console.error("Error fetching SGSO effectiveness:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    }
  } catch (error) {
    console.error("Error in SGSO effectiveness endpoint:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
