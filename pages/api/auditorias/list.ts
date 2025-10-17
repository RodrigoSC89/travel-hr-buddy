import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auditorias/list
 * Returns all IMCA auditorias from the database, ordered by date (most recent first)
 * Respects Row Level Security policies
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();

  try {
    // Fetch all auditorias ordered by date (most recent first)
    const { data: auditorias, error: auditoriasError } = await supabase
      .from("auditorias_imca")
      .select("id, navio, norma, item_auditado, comentarios, resultado, data")
      .order("data", { ascending: false });

    if (auditoriasError) throw auditoriasError;

    // Get unique vessel names for frota
    const frota = [...new Set(auditorias?.map((a) => a.navio).filter(Boolean) || [])];

    // Get cron status (this is a placeholder - you can implement actual cron status check)
    const cronStatus = "Ativo";

    res.status(200).json({
      auditorias: auditorias || [],
      frota,
      cronStatus,
    });
  } catch (error) {
    console.error("Erro ao buscar auditorias:", error);
    res.status(500).json({ 
      error: "Erro ao buscar auditorias",
      auditorias: [],
      frota: [],
      cronStatus: "Erro"
    });
  }
}
