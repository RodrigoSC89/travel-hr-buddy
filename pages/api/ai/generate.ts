import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt ausente" });
  }

  const apiKey = process.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here") {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const chat = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "Você é um assistente técnico especializado em documentação marítima."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const result = chat.choices[0].message.content;
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Erro ao gerar com IA:", error);
    return res.status(500).json({ error: "Erro na geração com IA" });
  }
}
