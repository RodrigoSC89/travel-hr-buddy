import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nomeNavio, contexto } = req.body;

    if (!nomeNavio || !contexto) {
      return res.status(400).json({ error: "Nome do navio e contexto são obrigatórios" });
    }

    const prompt = `Você é um auditor técnico especializado em normas IMCA (International Marine Contractors Association) para sistemas de posicionamento dinâmico (DP) e operações offshore.

Navio: ${nomeNavio}
Contexto da Operação: ${contexto}

Gere um relatório de auditoria técnica IMCA completo e detalhado que inclua:

1. RESUMO EXECUTIVO
   - Classificação de risco da operação
   - Principais achados críticos

2. ANÁLISE TÉCNICA
   - Avaliação do sistema DP
   - Análise de sensores e redundâncias
   - Avaliação de falhas reportadas

3. CONFORMIDADE IMCA
   - Verificação de conformidade com normas IMCA M 103, M 140, M 182
   - Gaps identificados
   - Recomendações de adequação

4. ANÁLISE DE RISCO
   - Eventos críticos identificados
   - Análise de causa raiz
   - Matriz de risco (probabilidade x severidade)

5. RECOMENDAÇÕES
   - Ações corretivas imediatas
   - Melhorias de médio prazo
   - Plano de ação sugerido

6. CONCLUSÃO
   - Status geral da operação
   - Certificação recomendada (se aplicável)

Formate o relatório de forma profissional, técnica e detalhada.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um auditor técnico especializado em normas IMCA para sistemas de posicionamento dinâmico e operações offshore marítimas.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const output = completion.choices[0].message.content;

    return res.status(200).json({ output });
  } catch (error) {
    console.error("Erro ao gerar auditoria IMCA:", error);
    return res.status(500).json({
      error: "Erro ao gerar relatório de auditoria",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
