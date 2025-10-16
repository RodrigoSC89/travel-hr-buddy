import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

interface AuditoriaResumo {
  nome_navio: string;
  total: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();
  
  // Extract query parameters
  const { start, end, user_id } = req.query;

  // Build query
  let query = supabase
    .from("peotram_audits")
    .select(`
      vessel_id,
      vessels!inner(name)
    `);

  // Apply filters
  if (start && typeof start === "string") {
    query = query.gte("audit_date", start);
  }
  
  if (end && typeof end === "string") {
    query = query.lte("audit_date", end);
  }
  
  if (user_id && typeof user_id === "string") {
    query = query.eq("created_by", user_id);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Group by vessel name and count
  const grouped = (data || []).reduce((acc: Record<string, number>, item) => {
    const vesselName = item.vessels?.name || "Desconhecido";
    acc[vesselName] = (acc[vesselName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array format for the chart
  const result: AuditoriaResumo[] = Object.entries(grouped).map(([nome_navio, total]) => ({
    nome_navio,
    total,
  }));

  // Sort by total descending
  result.sort((a, b) => b.total - a.total);

  return res.status(200).json(result);
}
