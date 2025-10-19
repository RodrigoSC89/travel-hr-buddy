/**
 * SGSO Requirement Explanation with AI
 * Provides detailed explanations of SGSO requirements using GPT-4
 */

import { openai } from "@/lib/openai";

/**
 * Explain a SGSO requirement using AI
 * Provides what the requirement demands, consequences of non-compliance, and best practices
 * 
 * @param requirement - The SGSO requirement title to explain
 * @param compliance - Current compliance status (compliant, partial, non-compliant)
 * @returns Explanation text or null if error occurs
 */
export async function explainRequirementSGSO(
  requirement: string,
  compliance: string
): Promise<string | null> {
  const prompt = `
Você é um auditor ambiental especializado em SGSO (Sistema de Gestão da Segurança Operacional) exigido pelo IBAMA.
Explique de forma clara o seguinte requisito:

"${requirement}"

Status atual do requisito: ${compliance}

Inclua:

✅ O que o requisito exige
⚠️ Por que é importante
🚨 Riscos do não cumprimento
🛠️ Recomendações para estar em conformidade

Responda de forma técnica e direta.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    return response.choices[0]?.message.content || null;
  } catch (error) {
    console.error("Error explaining SGSO requirement:", error);
    return null;
  }
}
