import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nomeNavio, contexto, user_id } = req.body;

  if (!nomeNavio || !contexto || !user_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `Você é um auditor técnico altamente qualificado em sistemas de posicionamento dinâmico (DP), com profunda familiaridade nas normas internacionais da IMCA, IMO e MTS.

Seu objetivo é gerar uma auditoria técnica detalhada para o navio ${nomeNavio}, com base no seguinte contexto operacional:
"""
${contexto}
"""

Use as seguintes normas:

IMCA M103 (projeto e operação DP)
IMCA M117 (qualificação de pessoal DP)
IMCA M190 (ensaios anuais)
IMCA M166 (FMEA)
IMCA M109 (documentação)
IMCA M220 (planejamento de operações)
IMCA M140 (gráficos de capacidade)
MSF 182 (operação segura de OSVs com DP)
Diretrizes MTS e IMO MSC.1/Circ.1580
Avalie sistemas, sensores, rede, pessoal, documentos, registros, falhas, mitigação e proponha plano de ação com níveis de risco e prazos recomendados.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Você é um especialista técnico em auditorias DP." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1800
    });

    const output = completion.choices[0]?.message?.content || "Erro ao gerar auditoria.";

    const supabase = createClient();

    // Salvar no Supabase
    const { error } = await supabase.from("auditorias_imca").insert([
      {
        nome_navio: nomeNavio,
        contexto,
        relatorio: output,
        user_id,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
    }

    res.status(200).json({ output });
  } catch (error) {
    console.error("Erro na geração de auditoria:", error);
    res.status(500).json({ error: "Erro na geração de auditoria." });
  }
}
