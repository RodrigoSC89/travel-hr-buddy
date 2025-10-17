import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

/**
 * POST /api/auditorias/explain
 * AI-powered endpoint using OpenAI GPT-4 to generate detailed technical explanations
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
 *   "resultado": "Detailed technical explanation with root cause, corrective actions, and norm references"
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
      resultado: "Serviço de IA temporariamente indisponível. Por favor, tente novamente mais tarde."
    });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `Você é um especialista em auditorias marítimas IMCA (International Marine Contractors Association).

Navio: ${navio}
Item Auditado: ${item}
Norma IMCA: ${norma}

O item foi marcado como "Não Conforme" durante a auditoria.

Por favor, forneça uma explicação técnica detalhada que inclua:
1. Análise da causa raiz da não conformidade
2. Explicação técnica específica relacionada aos padrões IMCA
3. Ações corretivas recomendadas
4. Referências às normas IMCA aplicáveis

Seja específico, técnico e focado em soluções práticas.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em auditorias marítimas IMCA com profundo conhecimento em normas e regulamentações de segurança marítima."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const resultado = completion.choices[0]?.message?.content || 
      "Não foi possível gerar a explicação. Por favor, tente novamente.";

    res.status(200).json({ resultado });
  } catch (error) {
    console.error("Erro ao gerar explicação IA:", error);
    res.status(500).json({ 
      error: "Erro ao gerar explicação",
      resultado: "Erro ao processar a solicitação de análise IA. Por favor, tente novamente."
    });
  }
}
