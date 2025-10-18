/**
 * Next.js API Route: /api/auditorias/list
 * Provides server-side data access for IMCA technical audits
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

interface Auditoria {
  id: string;
  navio: string;
  norma: string;
  item_auditado: string;
  comentarios: string;
  resultado: "Conforme" | "Não Conforme" | "Parcialmente Conforme" | "Não Aplicável";
  data: string;
}

interface ListaAuditoriasResponse {
  auditorias: Auditoria[];
  frota: string[];
  cronStatus: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListaAuditoriasResponse | { error: string }>
) {
  // Validate HTTP method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Fetch all audits from the auditorias_imca table
    const { data: auditorias, error: auditsError } = await supabase
      .from("auditorias_imca")
      .select("*")
      .order("data", { ascending: false });

    if (auditsError) {
      console.error("Error fetching audits:", auditsError);
      return res.status(500).json({ error: "Erro ao buscar auditorias" });
    }

    // Extract unique fleet names from audit records
    const frota = [...new Set(auditorias?.map(a => a.navio).filter(Boolean))] as string[];

    // Monitor cron job execution status
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
        const hoursSinceLastRun = (now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastRun > 24) {
          cronStatus = `Último run: ${Math.floor(hoursSinceLastRun)}h atrás`;
        } else {
          cronStatus = "Ativo (última execução nas últimas 24h)";
        }
      }
    } catch (error) {
      console.log("Cron status check failed (table may not exist)");
      // Continue with default status
    }

    // Return structured response
    return res.status(200).json({
      auditorias: auditorias || [],
      frota,
      cronStatus
    });

  } catch (error) {
    console.error("Error in lista API:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    });
  }
}
