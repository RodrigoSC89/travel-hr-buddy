import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Bunker AI - Action: ${action}`);

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "predict_consumption":
        systemPrompt = `Você é um especialista em otimização de consumo de combustível marítimo. 
Analise dados históricos e preveja consumo futuro com alta precisão.

Output em JSON com:
- predicted_consumption_tons: número
- confidence_score: 0.0-1.0
- recommended_refuel_date: YYYY-MM-DD
- optimal_refuel_port: nome do porto
- estimated_cost_usd: número
- potential_savings_usd: número
- optimization_tips: array de strings
- factors: array de {factor, impact: low/medium/high}`;

        userPrompt = `Analise os dados de consumo e preveja:

Histórico de Consumo:
${JSON.stringify(data.history || [], null, 2)}

Rota Planejada:
- Origem: ${data.origin || 'N/A'}
- Destino: ${data.destination || 'N/A'}
- Distância: ${data.distance_nm || 0} NM
- Velocidade planejada: ${data.planned_speed || 12} nós

Condições:
- Previsão meteorológica: ${data.weather_forecast || 'Normal'}
- Carga atual: ${data.cargo_weight || 0} tons
- Tipo de combustível: ${data.fuel_type || 'MGO'}

Estoque atual: ${data.current_stock_tons || 0} tons
ROB mínimo seguro: ${data.min_rob_tons || 50} tons`;
        break;

      case "compare_prices":
        systemPrompt = `Você é um analista de mercado de bunker marítimo.
Compare preços de combustível entre portos e recomende o melhor local para abastecimento.

Output em JSON com:
- recommended_port: nome
- price_per_ton_usd: número
- savings_vs_average_usd: número
- price_trend: rising/stable/falling
- confidence: 0.0-1.0
- port_rankings: array de {port, price, distance_nm, total_cost, score}
- analysis: string explicativa`;

        userPrompt = `Compare preços de bunker nos seguintes portos:

Portos disponíveis:
${JSON.stringify(data.ports || [], null, 2)}

Posição atual: ${data.current_position || 'N/A'}
Quantidade necessária: ${data.quantity_tons || 500} tons
Tipo de combustível: ${data.fuel_type || 'VLSFO'}
Urgência: ${data.urgency || 'normal'}`;
        break;

      case "optimize_route":
        systemPrompt = `Você é um especialista em otimização de rotas marítimas para economia de combustível.
Considere velocidade, correntes, weather routing e portos de abastecimento.

Output em JSON com:
- optimal_speed_knots: número
- estimated_fuel_consumption_tons: número
- recommended_stops: array de {port, purpose, eta}
- fuel_savings_percent: número
- co2_reduction_tons: número
- voyage_cost_usd: número
- recommendations: array de strings`;

        userPrompt = `Otimize a rota para economia de combustível:

Rota:
- Origem: ${data.origin}
- Destino: ${data.destination}
- Distância total: ${data.distance_nm} NM

Embarcação:
- Tipo: ${data.vessel_type || 'PSV'}
- Consumo base: ${data.base_consumption || 10} tons/dia
- Velocidade econômica: ${data.eco_speed || 10} nós
- Velocidade máxima: ${data.max_speed || 14} nós

Previsão meteorológica: ${data.weather || 'Normal'}
Prazo de chegada: ${data.deadline || 'Flexível'}`;
        break;

      case "efficiency_report":
        systemPrompt = `Você é um auditor de eficiência energética marítima.
Analise indicadores EEOI, CII e sugira melhorias baseadas nas normas IMO.

Output em JSON com:
- eeoi_value: número (gCO2/ton-nm)
- eeoi_rating: A/B/C/D/E
- cii_value: número
- cii_rating: A/B/C/D/E
- compliance_status: string
- improvement_potential_percent: número
- recommendations: array de strings
- benchmark_comparison: {fleet_average, industry_average, best_in_class}`;

        userPrompt = `Gere relatório de eficiência energética:

Dados da Embarcação:
${JSON.stringify(data.vessel || {}, null, 2)}

Histórico de Viagens (último mês):
${JSON.stringify(data.voyages || [], null, 2)}

Consumo total: ${data.total_consumption_tons || 0} tons
Distância total: ${data.total_distance_nm || 0} NM
Carga transportada: ${data.cargo_transported_tons || 0} tons`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Remove old console.log, already logged above
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_response: content };
    } catch {
      result = { raw_response: content };
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      result,
      generated_at: new Date().toISOString(),
      ai_model: "google/gemini-2.5-flash"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in bunker-ai:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
