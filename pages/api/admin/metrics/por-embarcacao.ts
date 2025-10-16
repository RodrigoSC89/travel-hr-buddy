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
    const { nome_navio } = req.query;
    
    // Call RPC function to get metrics by vessel
    const { data, error } = await supabase.rpc(
      "auditoria_metricas_por_embarcacao",
      { p_nome_navio: nome_navio ? String(nome_navio) : null }
    );

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar métricas por embarcação:", error);
    res.status(500).json({ error: "Erro ao buscar métricas por embarcação." });
  }
}
