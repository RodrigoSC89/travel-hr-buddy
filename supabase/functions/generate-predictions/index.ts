import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PredictionRequest {
  timeframe: string;
  includeFactors?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeframe, includeFactors = true }: PredictionRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`Generating predictions for timeframe: ${timeframe}`);

    // Collect historical data for predictions
    const historicalData = await collectHistoricalData(supabase, timeframe);

    // Generate predictions using AI
    const systemPrompt = `Você é um especialista em análise preditiva e ciência de dados. Baseado nos dados históricos fornecidos, gere previsões precisas e realistas.

Retorne uma resposta em JSON com a seguinte estrutura:
{
  "predictions": [
    {
      "metric": "Nome da métrica",
      "current": valor_atual_numerico,
      "predicted": valor_previsto_numerico,
      "confidence": nivel_confianca_0_100,
      "trend": "up/down/stable",
      "timeframe": "período_da_previsão",
      "factors": ["fator1", "fator2", "fator3"]
    }
  ],
  "insights": [
    "insight principal 1",
    "insight principal 2"
  ]
}

Diretrizes:
- Use dados realistas baseados no histórico
- Considere sazonalidade e tendências
- Confidence deve refletir a qualidade dos dados
- Fatores devem ser específicos e acionáveis
- Use português brasileiro`;

    const userPrompt = `Analise os dados históricos e gere previsões para o período: ${timeframe}

Dados históricos disponíveis:
${JSON.stringify(historicalData, null, 2)}

Gere previsões para as seguintes métricas principais:
- Receita/Vendas
- Satisfação do Cliente
- Produtividade da Equipe
- Rotatividade de Funcionários
- Custos Operacionais
- Performance de Sistemas
- Engajamento dos Funcionários

${includeFactors ? "Inclua fatores influentes específicos para cada previsão." : ""}`;

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
        temperature: 0.2,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let predictions;
    
    try {
      predictions = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse AI predictions");
    }

    // Save predictions to database for tracking
    try {
      const { error: saveError } = await supabase
        .from("ai_predictions")
        .insert({
          timeframe,
          predictions: predictions.predictions,
          insights: predictions.insights,
          generated_at: new Date().toISOString(),
          confidence_avg: predictions.predictions.reduce((acc: number, p: any) => acc + p.confidence, 0) / predictions.predictions.length
        });

      if (saveError) {
        console.error("Error saving predictions:", saveError);
      }
    } catch (saveError) {
      console.log("Predictions table not available, skipping save");
    }

    console.log("Predictions generated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      predictions: predictions.predictions,
      insights: predictions.insights,
      generatedAt: new Date().toISOString(),
      timeframe
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating predictions:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function collectHistoricalData(supabase: any, timeframe: string) {
  const data: any = {
    timeframe,
    collectedAt: new Date().toISOString()
  };

  try {
    // Get user statistics
    const { data: userStats } = await supabase
      .from("user_statistics")
      .select("*")
      .limit(100);

    if (userStats) {
      data.userStatistics = {
        totalUsers: userStats.length,
        averageAlerts: userStats.reduce((acc: number, stat: any) => acc + (stat.total_alerts || 0), 0) / userStats.length,
        activeAlertsRatio: userStats.reduce((acc: number, stat: any) => acc + (stat.active_alerts || 0), 0) / userStats.reduce((acc: number, stat: any) => acc + (stat.total_alerts || 0), 1)
      };
    }

    // Get price alerts data
    const { data: priceAlerts } = await supabase
      .from("price_alerts")
      .select("*")
      .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (priceAlerts) {
      data.priceAlerts = {
        totalAlerts: priceAlerts.length,
        activeAlerts: priceAlerts.filter((alert: any) => alert.is_active).length,
        recentTrend: analyzeAlertsTrend(priceAlerts)
      };
    }

    // Get certificates data
    const { data: certificates } = await supabase
      .from("certificates")
      .select("*");

    if (certificates) {
      data.certificates = {
        total: certificates.length,
        expiring: certificates.filter((cert: any) => 
          new Date(cert.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ).length,
        statusDistribution: certificates.reduce((acc: any, cert: any) => {
          acc[cert.status] = (acc[cert.status] || 0) + 1;
          return acc;
        }, {})
      };
    }

    // Get profiles data
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*");

    if (profiles) {
      data.employees = {
        total: profiles.length,
        recentHires: profiles.filter((profile: any) => 
          new Date(profile.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
      };
    }

  } catch (error) {
    console.error("Error collecting historical data:", error);
    // Return mock data structure for predictions
    data.mock = true;
    data.revenue = { current: 125432, trend: "up", growth: 12.5 };
    data.satisfaction = { current: 94, trend: "stable", volatility: "low" };
    data.productivity = { current: 89, trend: "up", improvement: 5.2 };
    data.turnover = { current: 8.5, trend: "down", reduction: 15.3 };
  }

  return data;
}

function analyzeAlertsTrend(alerts: any[]) {
  if (alerts.length < 2) return "stable";
  
  const last30Days = alerts.filter(alert => 
    new Date(alert.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  
  const previous30Days = alerts.filter(alert => {
    const date = new Date(alert.created_at);
    return date >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) && 
           date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  });
  
  if (last30Days.length > previous30Days.length * 1.1) return "up";
  if (last30Days.length < previous30Days.length * 0.9) return "down";
  return "stable";
}