import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  const { start, end, user_id } = req.query;

  try {
    let query = supabase
      .from("auditorias_imca")
      .select("nome_navio, created_at, user_id");

    if (start && end) {
      query = query
        .gte("created_at", start as string)
        .lte("created_at", end as string);
    }

    if (user_id) {
      query = query.eq("user_id", user_id as string);
    }

    const { data, error } = await query;

    if (error) throw error;

    const resumo: Record<string, number> = {};
    data.forEach((item) => {
      resumo[item.nome_navio] = (resumo[item.nome_navio] || 0) + 1;
    });

    const resultado = Object.entries(resumo).map(([nome_navio, total]) => ({
      nome_navio,
      total,
    }));

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao gerar resumo de auditorias:", error);
    res.status(500).json({ error: "Erro ao gerar resumo." });
  }
}
