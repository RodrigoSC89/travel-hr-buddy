import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch audits from database
    const { data: auditorias, error: auditsError } = await supabase
      .from("auditorias_imca")
      .select("*")
      .order("data", { ascending: false });

    if (auditsError) {
      console.error("Error fetching audits:", auditsError);
      return res.status(500).json({ error: "Erro ao buscar auditorias" });
    }

    // Get unique fleet names (navios)
    const frota = [
      ...new Set(auditorias?.map((a) => a.navio).filter(Boolean)),
    ] as string[];

    // Get cron status (from cron_execution_logs table if exists)
    let cronStatus = "Ativo";
    try {
      const { data: cronLogs } = await supabase
        .from("cron_execution_logs")
        .select("*")
        .eq("job_name", "auditorias_check")
        .order("executed_at", { ascending: false })
        .limit(1);

      if (cronLogs && cronLogs.length > 0) {
        const lastExecution = new Date(cronLogs[0].executed_at);
        const now = new Date();
        const hoursSinceLastRun =
          (now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastRun > 24) {
          cronStatus = `Último run: ${Math.floor(hoursSinceLastRun)}h atrás`;
        } else {
          cronStatus = "Ativo (última execução nas últimas 24h)";
        }
      }
    } catch (error) {
      console.log("Cron status check failed (table may not exist):", error);
      // Continue with default status
    }

    return res.status(200).json({
      auditorias: auditorias || [],
      frota,
      cronStatus,
    });
  } catch (error) {
    console.error("Error in list endpoint:", error);
    return res
      .status(500)
      .json({ error: (error as Error).message || "Erro interno do servidor" });
  }
}
