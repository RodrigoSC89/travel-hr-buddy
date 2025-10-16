import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PeotramAuditDate {
  audit_date: string;
  created_by: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { start, end, user_id } = req.query;

  try {
    let query = supabase.from("peotram_audits").select("audit_date, created_by");

    if (start && end) {
      query = query.gte("audit_date", start as string).lte("audit_date", end as string);
    }

    if (user_id) {
      query = query.eq("created_by", user_id as string);
    }

    const { data, error } = await query;
    if (error) throw error;

    const agrupado: Record<string, number> = {};
    (data as PeotramAuditDate[]).forEach((item) => {
      const dataFormatada = new Date(item.audit_date).toISOString().slice(0, 10);
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
