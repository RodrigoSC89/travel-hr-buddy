import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
});

interface ForecastRequest {
  vessel_name: string;
  system_name: string;
  last_maintenance_dates: string[];
  current_hourmeter: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body: ForecastRequest = req.body;
    const { vessel_name, system_name, last_maintenance_dates, current_hourmeter } = body;

    // Validate required fields
    if (!vessel_name || !system_name || !last_maintenance_dates || current_hourmeter === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: vessel_name, system_name, last_maintenance_dates, current_hourmeter" 
      });
    }

    const prompt = `
Você é um engenheiro especialista em manutenção preventiva offshore.

Com base nas informações abaixo, gere uma previsão técnica de manutenção.

Embarcação: ${vessel_name}
Sistema: ${system_name}
Últimas manutenções:
${last_maintenance_dates.join("\n")}

Horímetro atual: ${current_hourmeter} horas

Retorne:
1. A próxima intervenção recomendada
2. Por que ela é necessária
3. Impacto de não executá-la
4. Prioridade sugerida
5. Frequência sugerida para este sistema

Resposta estruturada em texto técnico.
`;

    // Set up streaming response headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [
        { role: "system", content: "Você é um engenheiro de manutenção marítima." },
        { role: "user", content: prompt },
      ],
    });

    // Stream the response
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: unknown) {
    console.error("Error in MMI forecast:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ 
      error: "Failed to generate forecast",
      details: errorMessage 
    });
  }
}
