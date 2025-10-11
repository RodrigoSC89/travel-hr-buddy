import type { NextApiRequest, NextApiResponse } from "./next-types";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string")
    return res.status(400).json({ error: "Prompt inválido" });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Você é um redator profissional que gera documentos claros, objetivos e bem estruturados com base em descrições curtas. Evite repetições, formate bem, mantenha linguagem formal.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0].message.content || "";
    return res.status(200).json({ content });
  } catch (err) {
    console.error("Erro na geração do documento:", err);
    return res.status(500).json({ error: "Erro ao gerar documento" });
  }
}
