import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { prompt, type, context } = req.body;

  if (!prompt && !type) {
    return res.status(400).json({ error: "Prompt ou tipo é obrigatório." });
  }

  try {
    // Build the AI prompt based on template type and context
    let aiPrompt = "";
    
    if (type && context) {
      aiPrompt = `
Você é um assistente de documentação técnica.
Crie um template do tipo: "${type}"
Baseado nesse contexto: ${context}
Formato estruturado e técnico.
      `.trim();
    } else if (prompt) {
      aiPrompt = prompt;
    } else {
      aiPrompt = `Crie um template de documento do tipo: ${type}`;
    }

    // Use Supabase Edge Function to generate content with OpenAI
    const { data, error } = await supabase.functions.invoke("generate-document", {
      body: { prompt: aiPrompt },
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      output: data?.content || "",
      prompt: aiPrompt,
    });
  } catch (error) {
    console.error("Error generating template with AI:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao gerar template com IA",
    });
  }
}
