import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient();
  const { nome_navio, contexto, relatorio } = req.body;

  if (!nome_navio || !contexto || !relatorio) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("auditorias_imca")
    .insert([
      {
        nome_navio,
        contexto,
        relatorio,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
}
