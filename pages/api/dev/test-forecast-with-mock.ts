import { NextApiRequest, NextApiResponse } from "next";

/**
 * Dev API Route: Test Forecast with Mock Data
 * This endpoint generates a forecast using mock data for testing purposes
 */

// Mock trend data for testing
const mockTrendData = [
  { date: "2025-08", jobs: 45, month: "Agosto" },
  { date: "2025-09", jobs: 52, month: "Setembro" },
  { date: "2025-10", jobs: 48, month: "Outubro" },
  { date: "2025-11", jobs: 61, month: "Novembro" },
  { date: "2025-12", jobs: 55, month: "Dezembro" },
  { date: "2026-01", jobs: 58, month: "Janeiro" },
];

// Mock historical data
const mockHistoricalData = {
  totalJobs: 312,
  jobsByStatus: {
    pending: 45,
    in_progress: 98,
    completed: 156,
    cancelled: 13,
  },
  jobsByComponent: {
    engine: 87,
    hull: 45,
    electrical: 62,
    hydraulic: 53,
    navigation: 38,
    safety: 27,
  },
  recentTrend: {
    last30Days: 58,
    previous30Days: 52,
    percentageChange: "11.54",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET or POST methods
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: "OPENAI_API_KEY não configurada",
        forecast: "⚠️ Erro: API Key da OpenAI não está configurada no servidor. Configure a variável de ambiente OPENAI_API_KEY."
      });
    }

    // System prompt for the AI
    const systemPrompt = `Você é um especialista em análise preditiva de manutenção e gestão de jobs. 
Baseado nos dados históricos de tendências de jobs fornecidos, gere uma previsão realista para os próximos 2 meses.

Retorne uma resposta em texto natural (não JSON) com:
1. 📊 Previsão quantitativa de jobs para os próximos 2 meses
2. 📈 Tendências esperadas (aumento/redução/estabilidade)
3. 🧠 Recomendações preventivas específicas e acionáveis
4. ⚠️ Pontos de atenção críticos

Use português brasileiro, seja conciso e específico.`;

    const userPrompt = `Analise os seguintes dados de tendência de jobs e gere uma previsão para os próximos 2 meses:

Dados de tendência fornecidos:
${JSON.stringify(mockTrendData, null, 2)}

Dados históricos do sistema:
${JSON.stringify(mockHistoricalData, null, 2)}

Gere uma previsão clara e acionável em formato de texto.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return res.status(500).json({ 
        error: `OpenAI API error: ${response.status}`,
        forecast: `⚠️ Erro ao chamar a API da OpenAI: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    const forecast = data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      forecast: forecast,
      generatedAt: new Date().toISOString(),
      mockData: {
        trend: mockTrendData,
        historical: mockHistoricalData,
      },
    });

  } catch (error) {
    console.error("Error in test-forecast-with-mock:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Erro desconhecido",
      forecast: `⚠️ Erro ao gerar previsão: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    });
  }
}
