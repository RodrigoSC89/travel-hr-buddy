import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();

  const { source, created_by, limit = 25 } = req.query;

  let query = supabase.from("forecast_history").select("*");

  if (source) query = query.eq("source", source.toString());
  if (created_by) query = query.eq("created_by", created_by.toString());

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(Number(limit));

  if (error) {
    return res.status(500).json({ error: "Erro ao carregar previsões." });
  }

  return res.status(200).json(data);
}
