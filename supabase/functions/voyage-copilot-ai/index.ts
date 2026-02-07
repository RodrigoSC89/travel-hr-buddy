/**
 * M026 - Voyage AI Copilot Edge Function
 * Comprehensive voyage planning: weather routing, bunker optimization, P&L prediction, risk analysis
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoyageCopilotRequest {
  type: 'plan' | 'optimize_route' | 'bunker_plan' | 'pnl_forecast' | 'risk_analysis' | 'chat';
  voyage?: {
    origin: string;
    destination: string;
    vessel_type?: string;
    cargo_type?: string;
    speed_knots?: number;
    fuel_type?: string;
    charter_rate?: number;
    distance_nm?: number;
  };
  messages?: Array<{ role: string; content: string }>;
  context?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, voyage, messages, context } = await req.json() as VoyageCopilotRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "plan":
        systemPrompt = `Você é o Voyage AI Copilot, especialista em planejamento de viagens marítimas com conhecimento de nível Veson IMOS Platform.

## CAPACIDADES
1. **Roteamento Inteligente**: Calcule distâncias, ETAs e rotas ótimas
2. **Análise Meteorológica**: Considere condições climáticas e estações do ano
3. **Otimização de Combustível**: Sugira velocidades econômicas e pontos de abastecimento
4. **Previsão P&L**: Estime receitas, custos e lucro da viagem
5. **Análise de Risco**: Identifique riscos operacionais, climáticos e regulatórios

## FORMATO DE RESPOSTA
Retorne SEMPRE em JSON válido com esta estrutura:
{
  "route": {
    "distance_nm": number,
    "eta_days": number,
    "waypoints": [{ "name": string, "lat": number, "lng": number, "reason": string }],
    "eca_zones": [string],
    "weather_advisory": string
  },
  "bunker": {
    "total_consumption_mt": number,
    "recommended_port": string,
    "estimated_cost_usd": number,
    "fuel_type": string,
    "bunkering_time_hours": number
  },
  "pnl": {
    "estimated_revenue_usd": number,
    "total_costs_usd": number,
    "fuel_costs_usd": number,
    "port_costs_usd": number,
    "estimated_profit_usd": number,
    "tce_usd_day": number,
    "margin_percent": number
  },
  "risks": [{ "type": string, "severity": "low"|"medium"|"high"|"critical", "description": string, "mitigation": string }],
  "recommendations": [string],
  "optimal_speed_knots": number,
  "co2_emissions_mt": number
}`;
        userPrompt = `Planeje a viagem completa:\n${JSON.stringify(voyage, null, 2)}\n\nContexto adicional: ${JSON.stringify(context || {})}`;
        break;

      case "optimize_route":
        systemPrompt = `Você é um especialista em otimização de rotas marítimas. Analise a rota e sugira otimizações considerando:
- Weather routing (evitar tempestades, correntes favoráveis)
- ECA zones (reduzir custos de combustível low-sulfur)
- Piracy zones (desviar de áreas de risco)
- Port congestion (evitar esperas desnecessárias)
- Canal transit (Suez, Panama - viabilidade e custos)
Responda em JSON com route_optimization, savings_estimate e alternative_routes.`;
        userPrompt = `Otimize esta rota:\n${JSON.stringify(voyage, null, 2)}`;
        break;

      case "bunker_plan":
        systemPrompt = `Você é um especialista em otimização de bunker (combustível marítimo) com conhecimento de 500+ portos globais.
Analise e sugira o plano de abastecimento ótimo considerando:
- Preços por região (Singapore, Rotterdam, Fujairah, Houston são hubs principais)
- Qualidade do combustível (ISO 8217)
- Capacidade dos tanques
- Rota e consumo previsto
- ECA zones (VLSFO vs MGO)
Responda em JSON com bunker_plan, cost_comparison e savings.`;
        userPrompt = `Planeje o abastecimento:\n${JSON.stringify(voyage, null, 2)}`;
        break;

      case "pnl_forecast":
        systemPrompt = `Você é um especialista em P&L (Profit & Loss) de voyages marítimas, com expertise em TCE (Time Charter Equivalent).
Calcule projeção financeira detalhada:
- Revenue (freight, demurrage, dispatch)
- Voyage costs (fuel, port, canal, agency)
- Operating costs (crew, maintenance, insurance)
- Capital costs (CAPEX, finance)
- TCE calculation
Responda em JSON com pnl_breakdown, tce_calculation e scenarios (best/base/worst).`;
        userPrompt = `Calcule P&L:\n${JSON.stringify(voyage, null, 2)}`;
        break;

      case "risk_analysis":
        systemPrompt = `Você é um especialista em gestão de risco marítimo. Analise riscos da viagem:
- Meteorológicos (tempestades, monções, ciclones)
- Geopolíticos (pirataria, sanções, guerra)
- Regulatórios (PSC, ECA, emissões)
- Operacionais (equipamentos, tripulação, carga)
- Financeiros (câmbio, demurrage, congestionamento)
Responda em JSON com risk_matrix, overall_risk_score e mitigation_plan.`;
        userPrompt = `Analise riscos:\n${JSON.stringify(voyage, null, 2)}`;
        break;

      case "chat":
      default:
        systemPrompt = `Você é o Voyage AI Copilot, assistente especializado em planejamento e otimização de viagens marítimas.
Expertise: rotas, bunker, P&L, TCE, weather routing, port costs, demurrage, laytime, charter party.
Responda em português de forma técnica e prática.`;
        break;
    }

    const aiMessages = type === "chat" && messages
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: type === "chat",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    if (type === "chat") {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Try to parse JSON from AI response
    let parsed = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Return raw text if not JSON
    }

    return new Response(JSON.stringify({ 
      success: true,
      result: parsed || content,
      raw: content,
      type
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Voyage Copilot error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
