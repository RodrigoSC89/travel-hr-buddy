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

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "calculate_pl":
        systemPrompt = `Você é um contador especializado em finanças marítimas.
Calcule o P&L (Profit & Loss) detalhado da viagem.

Output em JSON com:
- revenue: {freight, demurrage, despatch, other, total}
- costs: {bunker, port, crew, maintenance, insurance, overhead, canal, agency, total}
- net_result: número
- margin_percent: número
- tce_daily: número (Time Charter Equivalent)
- cost_breakdown_percent: objeto com % de cada custo
- variance_analysis: array de {item, budget, actual, variance, variance_percent}
- recommendations: array de strings`;

        userPrompt = `Calcule o P&L da viagem:

Viagem:
- Número: ${data.voyage_number}
- Rota: ${data.origin} → ${data.destination}
- Duração: ${data.duration_days} dias
- Distância: ${data.distance_nm} NM

Receitas:
${JSON.stringify(data.revenues || {}, null, 2)}

Custos:
${JSON.stringify(data.costs || {}, null, 2)}

Budget previsto: $${data.budget_total || 0}`;
        break;

      case "forecast_result":
        systemPrompt = `Você é um analista financeiro marítimo.
Preveja o resultado final da viagem baseado no progresso atual.

Output em JSON com:
- completion_percent: número
- completed_costs: número
- estimated_remaining_costs: número
- total_estimated_costs: número
- final_revenue_estimate: número
- final_net_result: número
- final_margin_percent: número
- risks: array de {risk, probability, impact_usd}
- confidence: 0.0-1.0`;

        userPrompt = `Preveja o resultado final da viagem:

Progresso:
- Viagem ${data.voyage_number}: ${data.completion_percent}% concluída
- Custos realizados: $${data.actual_costs}
- Receitas confirmadas: $${data.confirmed_revenue}

Orçamento original:
- Custos: $${data.budget_costs}
- Receitas: $${data.budget_revenue}

Condições atuais:
- Preço do bunker: $${data.current_fuel_price}/ton
- Dias restantes: ${data.remaining_days}
- Portos restantes: ${data.remaining_ports}`;
        break;

      case "optimize_costs":
        systemPrompt = `Você é um consultor de otimização de custos marítimos.
Identifique oportunidades de economia baseado no histórico.

Output em JSON com:
- total_optimization_potential_usd: número
- opportunities: array de {area, current_cost, potential_cost, saving, actions: string[]}
- priority_ranking: array de strings
- implementation_difficulty: easy/medium/hard para cada item
- payback_period_months: número estimado
- new_margin_estimate_percent: número`;

        userPrompt = `Analise oportunidades de otimização:

P&L atual:
${JSON.stringify(data.current_pl || {}, null, 2)}

Histórico de viagens similares:
${JSON.stringify(data.historical_voyages || [], null, 2)}

Benchmark do mercado:
${JSON.stringify(data.market_benchmark || {}, null, 2)}`;
        break;

      case "freight_forecast":
        systemPrompt = `Você é um analista de mercado de freight marítimo.
Preveja taxas de freight para a rota especificada.

Output em JSON com:
- current_rate_usd: número
- forecast_30d_rate: número
- forecast_90d_rate: número
- trend: rising/stable/falling
- confidence: 0.0-1.0
- factors: array de {factor, impact: positive/negative/neutral}
- recommendation: string
- optimal_contract_duration_days: número`;

        userPrompt = `Preveja freight rates:

Rota: ${data.origin} → ${data.destination}
Tipo de carga: ${data.cargo_type}
Tipo de embarcação: ${data.vessel_type}

Taxas atuais observadas: $${data.current_spot_rate}
Histórico (últimos 6 meses):
${JSON.stringify(data.rate_history || [], null, 2)}

Indicadores de mercado:
- Baltic Index: ${data.baltic_index || 'N/A'}
- Tendência de demanda: ${data.demand_trend || 'stable'}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Voyage Accounting AI - Action: ${action}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
    console.error("Error in voyage-accounting-ai:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
