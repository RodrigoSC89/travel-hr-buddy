import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/client";

interface StatsResponse {
  byVessel: Record<string, number>;
  bySeverity: { Alta: number; Média: number; Baixa: number };
  byMonth: Record<string, number>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("dp_incidents")
      .select("vessel, severity, incident_date");

    if (error) {
      console.error("Error fetching dp_incidents:", error);
      throw new Error(error.message);
    }

    const stats: StatsResponse = {
      byVessel: {},
      bySeverity: { Alta: 0, Média: 0, Baixa: 0 },
      byMonth: {},
    };

    for (const incident of data || []) {
      // Count by vessel
      const vessel = incident.vessel || "Desconhecido";
      stats.byVessel[vessel] = (stats.byVessel[vessel] || 0) + 1;

      // Count by severity
      const severity = incident.severity || "Indefinido";
      if (severity === "Alta" || severity === "Média" || severity === "Baixa") {
        stats.bySeverity[severity] += 1;
      }

      // Count by month
      const date = incident.incident_date ? new Date(incident.incident_date) : null;
      const monthKey = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : "Sem Data";
      stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error generating DP incident stats:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error generating stats",
    });
  }
}
