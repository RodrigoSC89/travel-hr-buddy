import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

/**
 * POST /api/auditorias/plano
 * AI-powered endpoint using OpenAI GPT-4 to generate action plans
 * for non-conforming audit items
 * 
 * Request Body:
 * {
 *   "navio": "Vessel name",
 *   "item": "Audited item",
 *   "norma": "IMCA M 179"
 * }
 * 
 * Response:
 * {
 *   "plano": "Detailed action plan with steps, timeline, and responsibilities"
 * }
 */
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
      error: "Missing required fields: navio, item, norma" 
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY not configured");
    return res.status(500).json({ 
      error: "API configuration error",
      plano: "Serviço de IA temporariamente indisponível. Por favor, tente novamente mais tarde."
    });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `Você é um especialista em auditorias marítimas IMCA (International Marine Contractors Association).

Navio: ${navio}
Item Auditado: ${item}
Norma IMCA: ${norma}

O item foi marcado como "Não Conforme" durante a auditoria.

Por favor, crie um plano de ação detalhado que inclua:
1. Passos específicos para corrigir a não conformidade
2. Cronograma sugerido para implementação
3. Responsabilidades (quem deve fazer o quê)
4. Critérios de verificação para confirmar a conformidade
5. Recursos necessários

Organize o plano de forma clara, numerada e acionável.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em auditorias marítimas IMCA focado em criar planos de ação práticos e eficazes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const plano = completion.choices[0]?.message?.content || 
      "Não foi possível gerar o plano de ação. Por favor, tente novamente.";

    res.status(200).json({ plano });
  } catch (error) {
    console.error("Erro ao gerar plano de ação:", error);
    res.status(500).json({ 
      error: "Erro ao gerar plano de ação",
      plano: "Erro ao processar a solicitação de plano de ação. Por favor, tente novamente."
    });
  }
}
