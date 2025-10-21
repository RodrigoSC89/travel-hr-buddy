/**
 * AI Telemetry Bridge
 * Integrates AI analysis with performance telemetry
 * Part of Nautilus One v3.3 - Performance Telemetry Module
 */

import { openai } from "@/lib/openai";

interface TelemetryMetrics {
  cpu: number;
  memory: number;
  fps: number;
  timestamp?: string;
}

/**
 * Generate AI-powered insights from telemetry data
 * Uses OpenAI GPT-3.5-turbo to analyze performance metrics
 * 
 * @param metrics - Performance metrics to analyze
 * @returns Promise<string> - AI-generated insight and recommendations
 */
export async function generateSystemInsight(
  metrics: TelemetryMetrics
): Promise<string> {
  try {
    const prompt = `
Analise os seguintes dados de telemetria do sistema Nautilus One:
- CPU: ${metrics.cpu}%
- Memória: ${metrics.memory} MB
- FPS: ${metrics.fps}

Gere um diagnóstico rápido com recomendação técnica em português.
Mantenha a resposta concisa (máximo 3 linhas).
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em análise de performance de sistemas. Forneça diagnósticos técnicos concisos e práticos.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const insight = response.choices[0]?.message?.content || "Sem insights disponíveis";
    console.log("🧠 Insight IA:", insight);
    return insight;
  } catch (error) {
    console.error("Erro ao gerar insight técnico:", error);
    return "Falha ao gerar insight de performance. Verifique a configuração da API OpenAI.";
  }
}

/**
 * Generate AI insight from prompt (generic function)
 * 
 * @param prompt - Text prompt for AI analysis
 * @returns Promise<string> - AI-generated response
 */
export async function generateAIInsight(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Sem resposta disponível";
  } catch (error) {
    console.error("Erro ao gerar insight IA:", error);
    return "Falha ao gerar insight. Verifique a configuração da API.";
  }
}
