import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * API Endpoint: GET /api/auditorias/list
 * 
 * Lists all IMCA technical audits with filtering support
 * Returns audit records with vessel name, date, standard, audited item, result, and comments
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();

    // Query auditorias_imca table
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, nome_navio, data, norma, item_auditado, resultado, comentarios, created_at")
      .order("data", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching auditorias:", error);
      throw error;
    }

    // Transform data to match expected format
    const auditorias = (data || []).map((item) => ({
      id: item.id,
      navio: item.nome_navio || "",
      data: item.data || item.created_at,
      norma: item.norma || "",
      item_auditado: item.item_auditado || "",
      resultado: item.resultado || "",
      comentarios: item.comentarios || "",
    }));

    return res.status(200).json(auditorias);
  } catch (error) {
    console.error("Error in auditorias list API:", error);
    return res.status(500).json({ 
      error: "Erro ao buscar auditorias",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
