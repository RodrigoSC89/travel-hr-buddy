import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY 
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { navio, item, norma } = req.body;

  if (!navio || !item || !norma) {
    return res.status(400).json({ 
      error: "Parâmetros obrigatórios: navio, item, norma" 
    });
  }

  try {
    const prompt = `Você é um auditor técnico especializado em normas IMCA (International Marine Contractors Association).

Uma auditoria identificou uma NÃO CONFORMIDADE com os seguintes dados:

🚢 Navio: ${navio}
📋 Norma IMCA: ${norma}
⚠️ Item auditado: ${item}

Por favor, forneça uma explicação técnica e detalhada sobre:

1. O que significa esta não conformidade
2. Por que é importante corrigir
3. Quais são os riscos envolvidos
4. Recomendações práticas para correção

Mantenha a explicação profissional, clara e objetiva.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Você é um auditor técnico especializado em normas IMCA com vasta experiência em segurança marítima e operações offshore." 
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const explicacao = response.choices?.[0]?.message?.content?.trim();

    if (!explicacao) {
      throw new Error("Não foi possível gerar explicação");
    }

    return res.status(200).json({ explicacao });
  } catch (error) {
    console.error("Erro ao gerar explicação com IA:", error);
    return res.status(500).json({ 
      error: "Erro ao gerar explicação com IA",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
