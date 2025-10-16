import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Query auditorias_imca table to get audit data
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, nome_navio, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Process data to calculate risk metrics by audit
    // For demo purposes, we'll generate synthetic failure counts based on audit ID
    const metricsData = data?.map((audit) => ({
      auditoria_id: `${audit.nome_navio}-${audit.id.slice(0, 8)}`,
      falhas_criticas: Math.floor(Math.random() * 10) + 1, // Simulated data
    })) || [];

    res.status(200).json(metricsData);
  } catch (error) {
    console.error("Erro ao buscar métricas de risco:", error);
    res.status(500).json({ error: "Erro ao buscar métricas de risco." });
  }
}
