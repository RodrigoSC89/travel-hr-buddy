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
    // Fetch audit data with findings and metadata
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, nome_navio, created_at, findings, metadata")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data for the component
    const metrics = (data as AuditoriaIMCA[])?.map((audit) => ({
      auditoria_id: `${audit.id}`,
      nome_navio: audit.metadata?.vessel_name || audit.nome_navio || "Unknown",
      falhas_criticas: audit.findings?.critical || 0,
      data_auditoria: audit.created_at,
    })) || [];

    res.status(200).json(metrics);
  } catch (error) {
    console.error("Erro ao buscar métricas de risco:", error);
    res.status(500).json({ error: "Erro ao buscar métricas de risco." });
  }
}
