import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuditoriaIMCA {
  id: string;
  nome_navio: string;
  created_at: string;
  findings?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  metadata?: {
    vessel_name?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Query auditorias_imca table to get audit data with findings
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, nome_navio, created_at, findings, metadata")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Process data to calculate risk metrics by audit
    const metricsData = (data as AuditoriaIMCA[])?.map((audit) => {
      // Extract vessel name from metadata or use nome_navio
      const vesselName = audit.metadata?.vessel_name || audit.nome_navio;
      
      // Extract critical failures count from findings JSONB structure
      // If findings exist and have critical count, use it; otherwise default to 0
      const criticalFailures = audit.findings?.critical || 0;
      
      return {
        auditoria_id: `${vesselName}-${audit.id.slice(0, 8)}`,
        embarcacao: vesselName,
        falhas_criticas: criticalFailures,
        data_auditoria: audit.created_at,
      };
    }) || [];

    res.status(200).json(metricsData);
  } catch (error) {
    console.error("Erro ao buscar métricas de risco:", error);
    res.status(500).json({ error: "Erro ao buscar métricas de risco." });
  }
}
