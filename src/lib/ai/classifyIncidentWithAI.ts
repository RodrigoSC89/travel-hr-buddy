/**
 * AI-powered incident classification using GPT-4
 * Analyzes incident descriptions and provides SGSO categorization
 */

import { openai } from "@/lib/openai";

export interface IncidentClassification {
  sgso_category: string;
  sgso_root_cause: string;
  sgso_risk_level: string;
}

/**
 * Classify an incident using GPT-4 based on SGSO guidelines
 * @param description - Incident description to analyze
 * @returns Classification object with category, root cause, and risk level
 */
export async function classifyIncidentWithAI(
  description: string
): Promise<IncidentClassification | null> {
  const system = `
Você é um auditor de segurança marítima, especializado em SGSO, auditorias técnicas IMCA e conformidade.
Dado um incidente, classifique conforme abaixo:

1. Categoria SGSO:
- Erro humano
- Falha de sistema
- Problema de comunicação
- Não conformidade com procedimento
- Fator externo (clima, mar, etc)
- Falha organizacional
- Ausência de manutenção preventiva

2. Causa raiz provável

3. Nível de risco: baixo, moderado, alto, crítico

Responda em JSON:
{
  "sgso_category": "...",
  "sgso_root_cause": "...",
  "sgso_risk_level": "..."
}
  `;

  const user = `Incidente: ${description}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      return null;
    }

    try {
      return JSON.parse(content) as IncidentClassification;
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Error classifying incident with AI:", error);
    return null;
  }
}
