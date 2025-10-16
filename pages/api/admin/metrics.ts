// API: /api/admin/metrics
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    // Call the RPC function to get metrics grouped by risk level
    const { data, error } = await supabase.rpc("auditoria_metricas_risco");

    if (error) {
      console.error("Erro ao buscar métricas:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao processar métricas:", error);
    return res.status(500).json({ 
      error: "Erro ao processar métricas de auditoria." 
    });
  }
}
