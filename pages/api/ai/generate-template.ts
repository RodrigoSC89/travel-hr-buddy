import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  if (method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { prompt } = body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt é obrigatório." });
  }

  try {
    // Call Supabase Edge Function for GPT-4 generation
    const { data, error } = await supabase.functions.invoke("generate-document", {
      body: { prompt },
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({ output: data?.content || "" });
  } catch (err: any) {
    console.error("Error generating template:", err);
    return res.status(500).json({ error: err.message || "Erro ao gerar template com IA." });
  }
}
