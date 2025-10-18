import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API endpoint to retrieve SGSO risk level trend data by month
 * 
 * Returns monthly aggregated data of incidents by SGSO risk level:
 * [
 *   {
 *     "mes": "2025-10-01",
 *     "risco": "crítico",
 *     "total": 5
 *   },
 *   {
 *     "mes": "2025-10-01",
 *     "risco": "alto",
 *     "total": 12
 *   }
 * ]
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Try to use the RPC function first
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_sgso_trend");

    if (!rpcError && rpcData) {
      // Transform the data to match expected format
      const formattedData = rpcData.map((row: { mes: string; sgso_risk_level: string; total: number }) => ({
        mes: row.mes, // YYYY-MM-DD format
        risco: row.sgso_risk_level,
        total: row.total,
      }));

      return res.status(200).json(formattedData);
    }

    // Fallback: Query directly if RPC doesn't exist yet
    const { data, error } = await supabase
      .from("dp_incidents")
      .select("updated_at, sgso_risk_level")
      .not("sgso_risk_level", "is", null);

    if (error) {
      console.error("Error fetching SGSO trend:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      // Return sample data when no incidents exist
      return res.status(200).json([
        { mes: "2025-10", risco: "baixo", total: 8 },
        { mes: "2025-10", risco: "moderado", total: 5 },
        { mes: "2025-10", risco: "alto", total: 3 },
        { mes: "2025-10", risco: "crítico", total: 1 },
        { mes: "2025-09", risco: "baixo", total: 10 },
        { mes: "2025-09", risco: "moderado", total: 7 },
        { mes: "2025-09", risco: "alto", total: 2 },
        { mes: "2025-09", risco: "crítico", total: 2 },
      ]);
    }

    // Process data manually
    interface TrendEntry {
      mes: string;
      risco: string;
      total: number;
    }

    const trendMap = new Map<string, TrendEntry>();

    data.forEach((incident) => {
      if (!incident.updated_at || !incident.sgso_risk_level) return;

      const date = new Date(incident.updated_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const key = `${month}-${incident.sgso_risk_level}`;

      if (trendMap.has(key)) {
        const existing = trendMap.get(key)!;
        existing.total += 1;
      } else {
        trendMap.set(key, {
          mes: month,
          risco: incident.sgso_risk_level,
          total: 1,
        });
      }
    });

    // Convert map to array and sort by month descending
    const trendData = Array.from(trendMap.values()).sort(
      (a, b) => b.mes.localeCompare(a.mes)
    );

    return res.status(200).json(trendData);
  } catch (error: unknown) {
    console.error("Error in sgso-trend endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: errorMessage });
  }
}
