import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { requirementTitle, description, evidence, complianceStatus } = req.body;

    if (!requirementTitle || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build the prompt for AI analysis
    const prompt = `
Você é um auditor técnico de embarcações offshore especializado em SGSO (Sistema de Gestão de Segurança Operacional) com base nos critérios da Resolução ANP 43/2007.

Analise o seguinte requisito de auditoria SGSO:

**Requisito:** ${requirementTitle}
**Descrição:** ${description}
**Status de Conformidade:** ${complianceStatus}
**Evidência Fornecida:** ${evidence || "Nenhuma evidência fornecida"}

Com base nessas informações, forneça uma análise detalhada em formato JSON contendo:

1. **causa_provavel**: Identifique a causa provável da não conformidade ou da situação atual (se aplicável). Se o item estiver conforme, explique os fatores que contribuem para a conformidade.

2. **recomendacao**: Forneça sugestões de ações corretivas específicas e práticas que podem ser implementadas para melhorar ou manter a conformidade. Seja específico e prático.

3. **impacto**: Descreva o impacto operacional e de segurança da situação atual, considerando tanto riscos quanto oportunidades de melhoria.

4. **analise_completa**: Forneça uma análise geral mais detalhada que integre os três pontos anteriores e adicione insights adicionais relevantes para operações offshore.

Responda APENAS com um objeto JSON válido, sem texto adicional antes ou depois.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em auditoria SGSO e segurança operacional offshore. Responda sempre em português brasileiro e forneça análises técnicas detalhadas e práticas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const analysisText = response.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(analysisText);

    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error("Error analyzing SGSO item:", error);
    return res.status(500).json({ 
      error: "Failed to analyze SGSO item",
      message: error.message 
    });
  }
}
