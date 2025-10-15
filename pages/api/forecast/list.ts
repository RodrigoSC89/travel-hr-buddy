import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("forecast_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return res.status(500).json({ error: "Erro ao carregar previsões." });
  }

  return res.status(200).json(data);
}
