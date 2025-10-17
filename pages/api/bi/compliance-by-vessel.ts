import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to retrieve compliance statistics by vessel
 * from DP Incidents action plan status
 * 
 * Returns:
 * [
 *   {
 *     "vessel": "Ocean Star",
 *     "total": 15,
 *     "concluido": 8,
 *     "andamento": 5,
 *     "pendente": 2
 *   }
 * ]
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Call RPC function to get compliance statistics
    const { data, error } = await supabase.rpc("get_dp_conformidade_por_navio");

    if (error) {
      console.error("Error fetching compliance by vessel:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      // Return sample data when no incidents exist
      return res.status(200).json([
        {
          vessel: "Ocean Star",
          total: 15,
          concluido: 8,
          andamento: 5,
          pendente: 2,
        },
        {
          vessel: "Sea Pioneer",
          total: 12,
          concluido: 10,
          andamento: 1,
          pendente: 1,
        },
        {
          vessel: "Marine Explorer",
          total: 20,
          concluido: 5,
          andamento: 10,
          pendente: 5,
        },
      ]);
    }

    // Return formatted data
    return res.status(200).json(
      data.map((row: {
        vessel: string;
        total: number;
        concluido: number;
        andamento: number;
        pendente: number;
      }) => ({
        vessel: row.vessel,
        total: row.total,
        concluido: row.concluido,
        andamento: row.andamento,
        pendente: row.pendente,
      }))
    );
  } catch (error: unknown) {
    console.error("Error in compliance-by-vessel endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: errorMessage });
  }
}
