import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();

  const { start, end, user_id } = req.query;

  // Build the query to fetch audits with vessel information
  let query = supabase
    .from("peotram_audits")
    .select(`
      id,
      vessel_id,
      audit_date,
      created_by,
      vessels (
        name
      )
    `);

  // Apply filters if provided
  if (start) {
    query = query.gte("audit_date", start.toString());
  }
  
  if (end) {
    query = query.lte("audit_date", end.toString());
  }
  
  if (user_id) {
    query = query.eq("created_by", user_id.toString());
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: "Erro ao carregar resumo de auditorias." });
  }

  // Group by vessel name and count
  const resumo: { [key: string]: number } = {};
  
  interface AuditData {
    id: string;
    vessel_id: string | null;
    audit_date: string;
    created_by: string;
    vessels: {
      name: string;
    } | null;
  }
  
  data?.forEach((audit: AuditData) => {
    const nomeNavio = audit.vessels?.name || "Sem Embarcação";
    resumo[nomeNavio] = (resumo[nomeNavio] || 0) + 1;
  });

  // Convert to array format for chart
  const resultado = Object.entries(resumo).map(([nome_navio, total]) => ({
    nome_navio,
    total,
  }));

  // Sort by total (descending)
  resultado.sort((a, b) => b.total - a.total);

  return res.status(200).json(resultado);
}
