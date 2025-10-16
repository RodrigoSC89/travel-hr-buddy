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

  const { start, end, user_id } = req.query;

  try {
    let query = supabase
      .from("peotram_audits")
      .select(`
        audit_date,
        created_by,
        vessel_id,
        vessels!inner (
          name
        )
      `);

    if (start && end) {
      query = query
        .gte("audit_date", start as string)
        .lte("audit_date", end as string);
    }

    if (user_id) {
      query = query.eq("created_by", user_id as string);
    }

    const { data, error } = await query;

    if (error) throw error;

    const resumo: Record<string, number> = {};
    data.forEach((item: { vessels?: { name?: string } }) => {
      const vesselName = item.vessels?.name || "Unknown";
      resumo[vesselName] = (resumo[vesselName] || 0) + 1;
    });

    const resultado = Object.entries(resumo)
      .map(([nome_navio, total]) => ({
        nome_navio,
        total,
      }))
      .sort((a, b) => b.total - a.total);

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao gerar resumo de auditorias:", error);
    res.status(500).json({ error: "Erro ao gerar resumo." });
  }
}
