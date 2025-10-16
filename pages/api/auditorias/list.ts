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
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, navio, audit_date, norma, resultado, item_auditado, comentarios, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data to match the expected format
    const auditorias = data.map((item) => ({
      id: item.id,
      navio: item.navio || "N/A",
      data: item.audit_date || item.created_at,
      norma: item.norma || "IMCA",
      resultado: item.resultado || "Observação",
      item_auditado: item.item_auditado || "Item não especificado",
      comentarios: item.comentarios || "Sem comentários",
    }));

    res.status(200).json(auditorias);
  } catch (error) {
    console.error("Erro ao buscar auditorias:", error);
    res.status(500).json({ error: "Erro ao buscar auditorias." });
  }
}
