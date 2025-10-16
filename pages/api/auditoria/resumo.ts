import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("nome_navio", { count: "exact", head: false });

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
