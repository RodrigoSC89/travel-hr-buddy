import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { navio, item, norma } = req.body;

    if (!navio || !item || !norma) {
      return res.status(400).json({ error: "Campos obrigatórios: navio, item, norma" });
    }

    const prompt = `Você é um especialista em auditorias marítimas IMCA (International Marine Contractors Association).

Embarcação: ${navio}
Norma IMCA: ${norma}
Item não conforme: ${item}

Por favor, forneça uma explicação técnica detalhada sobre esta não conformidade:
1. O que significa esta não conformidade
2. Por que é importante corrigir
3. Quais os riscos associados
4. Recomendações práticas para correção

Seja claro, técnico e objetivo.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em auditorias marítimas IMCA com profundo conhecimento técnico de normas e procedimentos de segurança marítima.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const explicacao = completion.choices[0]?.message?.content || "Não foi possível gerar explicação";

    return res.status(200).json({ explicacao });
  } catch (error) {
    console.error("Erro ao gerar explicação com IA:", error);
    return res.status(500).json({ error: "Erro ao gerar explicação" });
  }
}
