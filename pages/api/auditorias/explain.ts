import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

/**
 * API endpoint to generate AI explanations for non-conformities in IMCA audits
 * POST /api/auditorias/explain
 * Body: { navio: string, item: string, norma: string }
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

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate AI explanation
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em auditorias técnicas marítimas IMCA (International Marine Contractors Association). 
Forneça explicações técnicas detalhadas sobre não conformidades em auditorias, causas raiz e ações corretivas recomendadas.`,
        },
        {
          role: "user",
          content: `Explique a não conformidade encontrada na auditoria:
- Navio: ${navio}
- Item Auditado: ${item}
- Norma IMCA: ${norma}

Forneça:
1. Explicação técnica da não conformidade
2. Possíveis causas raiz
3. Ações corretivas recomendadas
4. Referências à norma IMCA aplicável`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const explanation = completion.choices[0]?.message?.content || 
      "Não foi possível gerar uma explicação neste momento.";

    return res.status(200).json({ 
      resultado: explanation 
    });
  } catch (error) {
    console.error("Error generating AI explanation:", error);
    
    // Handle OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured" 
        });
      }
    }
    
    return res.status(500).json({ 
      error: "Failed to generate AI explanation" 
    });
  }
}
