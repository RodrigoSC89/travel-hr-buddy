/**
 * SGSO AI Action Plan Generator
 * Generates corrective, preventive actions and AI recommendations for SGSO incidents
 */

import { openai } from "@/lib/openai";

export interface SGSOIncident {
  description: string;
  sgso_category: string;
  sgso_root_cause: string;
  sgso_risk_level: string;
}

export interface SGSOActionPlan {
  corrective_action: string;
  preventive_action: string;
  recommendation: string;
}

/**
 * Generate SGSO action plan using GPT-4
 * @param incident - The incident details
 * @returns Action plan with corrective, preventive actions and recommendation
 */
export async function generateSGSOActionPlan(
  incident: SGSOIncident
): Promise<SGSOActionPlan | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // If OpenAI API is not available, return mock recommendation
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.warn("OpenAI API key not configured, using mock action plan");
    return {
      corrective_action: `Revisar procedimento relacionado a: ${incident.description.substring(0, 50)}... e treinar equipe responsável.`,
      preventive_action: "Implementar checklist de verificação dupla para operações similares e realizar simulações periódicas.",
      recommendation: `Adotar padrões IMCA para ${incident.sgso_category.toLowerCase()} e realizar auditorias mensais de conformidade.`,
    };
  }

  const system = `
Você é um especialista em segurança marítima (SGSO), atuando com base em normas IMCA e boas práticas offshore.

Para cada incidente, você deve propor:

1. ✅ Ação corretiva imediata
2. 🔁 Ação preventiva de médio/longo prazo
3. 📚 Recomendação extra, se aplicável

Responda no formato JSON com chaves:
{
  "corrective_action": "...",
  "preventive_action": "...",
  "recommendation": "..."
}
  `;

  const user = `
Incidente: ${incident.description}
Categoria SGSO: ${incident.sgso_category}
Causa raiz: ${incident.sgso_root_cause}
Nível de risco: ${incident.sgso_risk_level}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      return null;
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating SGSO action plan:", error);
    return null;
  }
}
