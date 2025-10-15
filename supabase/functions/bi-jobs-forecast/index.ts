import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobsForecastRequest {
  trend: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trend }: JobsForecastRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Generating jobs forecast based on trend data");

    // Prepare the trend data for analysis
    const trendSummary = analyzeTrend(trend);

    // Generate forecast using AI
    const systemPrompt = `Você é um especialista em análise de dados de recursos humanos e previsões de demanda de trabalho. 
Baseado nos dados de tendência de jobs fornecidos, gere uma previsão detalhada e recomendações preventivas.

Retorne uma resposta em texto formatado (não JSON) que inclua:

📊 PREVISÃO PARA OS PRÓXIMOS 2 MESES:
- Análise das tendências observadas
- Previsão de volume de jobs
- Períodos críticos identificados
- Nível de confiança da previsão

🧠 RECOMENDAÇÕES PREVENTIVAS:
- Ações recomendadas baseadas nos dados
- Preparação para períodos de alta demanda
- Estratégias de otimização
- Alertas importantes

Use emojis apropriados e formatação clara para facilitar a leitura.
Use português brasileiro.`;

    const userPrompt = `Analise os dados de tendência de jobs e gere uma previsão completa:

Dados de tendência:
${JSON.stringify(trendSummary, null, 2)}

Gere a previsão considerando:
- Volume total de jobs
- Padrões sazonais identificados
- Tendências de crescimento ou redução
- Períodos críticos
- Recomendações baseadas nos dados reais fornecidos`;

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
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const forecast = data.choices[0].message.content;

    console.log("Forecast generated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      forecast,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating jobs forecast:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function analyzeTrend(trend: any[]) {
  if (!trend || trend.length === 0) {
    return {
      dataPoints: 0,
      message: "Sem dados de tendência disponíveis"
    };
  }

  const summary: any = {
    totalDataPoints: trend.length,
    summary: {}
  };

  // Calculate basic statistics from the trend data
  if (Array.isArray(trend)) {
    // Check if trend contains objects with date/value pairs
    const hasDateValue = trend.some(item => 
      typeof item === 'object' && (item.date || item.value || item.count)
    );

    if (hasDateValue) {
      // Extract values for analysis
      const values = trend.map(item => 
        item.value || item.count || item.total || 0
      );
      
      summary.summary = {
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        total: values.reduce((a, b) => a + b, 0),
        trend: calculateTrend(values)
      };
    }
    
    // Include first and last few data points for context
    summary.recentData = trend.slice(-5);
    summary.oldestData = trend.slice(0, 3);
  }

  return summary;
}

function calculateTrend(values: number[]) {
  if (values.length < 2) return "stable";
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const difference = ((avgSecond - avgFirst) / avgFirst) * 100;
  
  if (difference > 10) return "crescente";
  if (difference < -10) return "decrescente";
  return "estável";
}
