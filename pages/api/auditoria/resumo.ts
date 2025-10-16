import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

interface AuditoriaResumo {
  nome_navio: string;
  total: number;
}

interface AuditWithVessel {
  id: string;
  vessel_id: string | null;
  created_by: string;
  audit_date: string;
  vessels: {
    name: string;
  } | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  const { start, end, user_id } = req.query;

  try {
    // Build the query to fetch audits with vessel information
    let query = supabase
      .from("peotram_audits")
      .select(`
        id,
        vessel_id,
        created_by,
        audit_date,
        vessels!inner (
          name
        )
      `);

    // Apply filters if provided
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
      console.error("Error fetching auditoria resumo:", error);
      return res.status(500).json({ error: error.message });
    }

    // Group by vessel name and count
    const resumo: Record<string, number> = {};
    
    if (data) {
      data.forEach((audit: AuditWithVessel) => {
        const vesselName = audit.vessels?.name || "Unknown";
        resumo[vesselName] = (resumo[vesselName] || 0) + 1;
      });
    }

    // Convert to array format for recharts
    const result: AuditoriaResumo[] = Object.entries(resumo).map(([nome_navio, total]) => ({
      nome_navio,
      total
    }));

    // Sort by total descending
    result.sort((a, b) => b.total - a.total);

    return res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error in auditoria resumo:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
