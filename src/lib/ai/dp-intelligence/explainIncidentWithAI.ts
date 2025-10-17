/**
 * DP Incident AI Analysis
 * Uses OpenAI to analyze DP (Dynamic Positioning) incidents based on IMCA guidelines
 */

import { openai } from "@/lib/openai";

export interface IncidentAnalysis {
  causa_provavel: string;
  medidas_prevencao: string;
  impacto_operacional: string;
  referencia_normativa: string;
  grau_severidade: "Alta" | "Média" | "Baixa";
}

/**
 * Analyze a DP incident using AI based on IMCA guidelines
 * @param incident - The incident description to analyze
 * @returns Structured analysis with causes, prevention, impact, references, and severity
 */
export async function explainIncidentWithAI(incident: string): Promise<IncidentAnalysis> {
  const prompt = `
Você é um especialista em operações DP (Dynamic Positioning) offshore, com base nas diretrizes da IMCA.
Analise o seguinte incidente:

"${incident}"

Retorne:
1. Causa provável
2. Medidas de prevenção
3. Impacto operacional
4. Referência normativa (IMCA M103, M220, etc)
5. Grau de severidade (Alta, Média, Baixa)

Resposta em formato JSON com as chaves:
- causa_provavel
- medidas_prevencao
- impacto_operacional
- referencia_normativa
- grau_severidade
  `.trim();

  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    const analysis = JSON.parse(content) as IncidentAnalysis;
    
    // Validate that all required fields are present
    if (!analysis.causa_provavel || !analysis.medidas_prevencao || 
        !analysis.impacto_operacional || !analysis.referencia_normativa || 
        !analysis.grau_severidade) {
      throw new Error("AI response missing required fields");
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing incident with AI:", error);
    throw new Error("Failed to analyze incident: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}
