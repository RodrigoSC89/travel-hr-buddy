import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  const { start, end, user_id } = req.query;

  try {
    let query = supabase.from("auditorias_imca").select("created_at, user_id");

    if (start && end) {
      query = query.gte("created_at", start as string).lte("created_at", end as string);
    }

    if (user_id) {
      query = query.eq("user_id", user_id as string);
    }

    const { data, error } = await query;
    if (error) throw error;

    const agrupado: Record<string, number> = {};
    data.forEach((item) => {
      const dataFormatada = new Date(item.created_at).toISOString().slice(0, 10);
      agrupado[dataFormatada] = (agrupado[dataFormatada] || 0) + 1;
    });

    const resultado = Object.entries(agrupado).map(([data, total]) => ({
      data,
      total,
    }));

    res.status(200).json(resultado.sort((a, b) => a.data.localeCompare(b.data)));
  } catch (error) {
    console.error("Erro ao gerar tendência:", error);
    res.status(500).json({ error: "Erro ao gerar tendência." });
  }
}
