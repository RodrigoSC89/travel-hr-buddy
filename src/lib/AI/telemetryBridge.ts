import { openai } from "@/lib/ai/openai-client";

/**
 * Generates AI insights from a prompt
 */
export async function generateAIInsight(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um assistente técnico especializado em análise de sistemas e performance.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Sem resposta disponível.";
  } catch (error) {
    console.error("Erro ao gerar insight com OpenAI:", error);
    throw error;
  }
}

/**
 * Integração entre IA e Telemetria — traduz dados técnicos em insights
 */
export async function generateSystemInsight(metrics: any) {
  try {
    const prompt = `
      Analise os seguintes dados de telemetria do sistema Nautilus One:
      CPU: ${metrics.cpu}%, Memória: ${metrics.memory}MB, FPS: ${metrics.fps}.
      Gere um diagnóstico rápido com recomendação técnica.
    `;

    const response = await generateAIInsight(prompt);
    console.log("🧠 Insight IA:", response);
    return response;
  } catch (error) {
    console.error("Erro ao gerar insight técnico:", error);
    return "Falha ao gerar insight de performance.";
  }
}
