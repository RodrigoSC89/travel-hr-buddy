import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();

  // Get optional filter parameters from query string
  const { source, created_by, created_at } = req.query;

  // Start building query
  let query = supabase
    .from("forecast_history")
    .select("*");

  // Apply filters if provided (case-insensitive partial matching for text fields)
  if (source && typeof source === "string") {
    query = query.ilike("source", `%${source}%`);
  }

  if (created_by && typeof created_by === "string") {
    query = query.ilike("created_by", `%${created_by}%`);
  }

  // Apply date filter (match full day range)
  if (created_at && typeof created_at === "string") {
    const startOfDay = new Date(created_at);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(created_at);
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString());
  }

  // Apply ordering and limit
  query = query
    .order("created_at", { ascending: false })
    .limit(25);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: "Erro ao carregar previsões." });
  }

  return res.status(200).json(data);
}
