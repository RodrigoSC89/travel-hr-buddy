import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();
  
  // Get query parameters for filtering
  const { source, created_by } = req.query;

  // Start building the query
  let query = supabase
    .from("forecast_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  // Apply filters if provided (case-insensitive partial matching)
  if (source && typeof source === "string") {
    query = query.ilike("source", `%${source}%`);
  }
  
  if (created_by && typeof created_by === "string") {
    query = query.ilike("created_by", `%${created_by}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: "Erro ao carregar previsões." });
  }

  return res.status(200).json(data);
}
