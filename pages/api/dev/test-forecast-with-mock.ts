import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { mockJobs } from "@/lib/dev/mocks/jobsForecastMock";
import { createClient } from "@/lib/supabase/server";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();


  const trendByComponent: Record<string, string[]> = {};
  mockJobs.forEach(job => {
    const month = job.completed_at.slice(0, 7);
    if (!trendByComponent[job.component_id]) trendByComponent[job.component_id] = [];
    trendByComponent[job.component_id].push(month);
  });


  const prompt = `Você é uma IA embarcada de manutenção. Abaixo estão os dados de jobs por componente (por mês):\n
${JSON.stringify(trendByComponent, null, 2)}\n\n
Gere uma previsão para os próximos 2 meses por componente e destaque os mais críticos.`;


  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Você é uma IA técnica preditiva embarcada no módulo de manutenção do Nautilus One." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });


  const forecast = completion.choices[0].message.content || "";


  // Salvar previsão no histórico
  await supabase.from("forecast_history").insert({
    source: "dev-mock",
    forecast_summary: forecast,
    created_by: "dev",
    created_at: new Date().toISOString()
  });


  res.status(200).json({ forecast });
}
