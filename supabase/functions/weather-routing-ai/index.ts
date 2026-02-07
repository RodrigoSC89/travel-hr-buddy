/**
 * M028 - Weather Routing AI Edge Function
 * Maritime weather analysis with route optimization based on forecast data
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherRoutingRequest {
  type: 'forecast' | 'route_weather' | 'alert_check' | 'optimal_window' | 'chat';
  route?: {
    origin: { lat: number; lng: number; name: string };
    destination: { lat: number; lng: number; name: string };
    waypoints?: Array<{ lat: number; lng: number; name: string }>;
  };
  vessel?: {
    type: string;
    max_wave_height_m?: number;
    max_wind_speed_kts?: number;
  };
  departure_date?: string;
  messages?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, route, vessel, departure_date, messages } = await req.json() as WeatherRoutingRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "forecast":
        systemPrompt = `Você é um meteorologista marítimo especializado. Forneça previsão detalhada:
- Vento (direção, velocidade, rajadas)
- Ondas (altura significativa, período, direção)
- Correntes (velocidade, direção)
- Visibilidade
- Precipitação
- Temperatura ar/água
- Pressão atmosférica
- Alertas (tempestade, ciclone, nevoeiro)

Responda em JSON:
{
  "forecast_days": [
    {
      "date": "YYYY-MM-DD",
      "wind": { "direction": string, "speed_kts": number, "gusts_kts": number },
      "waves": { "height_m": number, "period_s": number, "direction": string },
      "current": { "speed_kts": number, "direction": string },
      "visibility_nm": number,
      "precipitation": string,
      "temp_air_c": number,
      "temp_water_c": number,
      "pressure_hpa": number,
      "beaufort_scale": number,
      "sea_state": string,
      "risk_level": "low"|"moderate"|"high"|"severe"
    }
  ],
  "alerts": [{ "type": string, "severity": string, "description": string, "valid_from": string, "valid_to": string }],
  "overall_conditions": string,
  "recommendation": string
}`;
        userPrompt = `Previsão meteorológica marítima para rota:\n${JSON.stringify(route, null, 2)}\nData partida: ${departure_date || "hoje"}`;
        break;

      case "route_weather":
        systemPrompt = `Você é um especialista em weather routing marítimo (nível StormGeo/DTN).
Analise a rota versus condições meteorológicas e sugira:
1. Rota otimizada (desvios para evitar mau tempo)
2. Velocidade ideal por trecho
3. Janelas de passagem seguras
4. Impacto no consumo de combustível
5. ETA ajustada

Responda em JSON com optimized_route, fuel_impact, eta_adjustment e weather_windows.`;
        userPrompt = `Otimize rota com weather:\nRota: ${JSON.stringify(route, null, 2)}\nNavio: ${JSON.stringify(vessel, null, 2)}\nPartida: ${departure_date}`;
        break;

      case "alert_check":
        systemPrompt = `Verifique alertas meteorológicos ativos para a região marítima.
Classifique por severidade e impacto operacional.
Responda em JSON com active_alerts, impacted_areas e operational_impact.`;
        userPrompt = `Check alertas para: ${JSON.stringify(route, null, 2)}`;
        break;

      case "optimal_window":
        systemPrompt = `Encontre a janela ótima de partida nos próximos 7 dias.
Considere: condições meteorológicas, marés, correntes, consumo de combustível.
Responda em JSON com optimal_windows (top 3), comparison_table e recommendation.`;
        userPrompt = `Janela ótima para: ${JSON.stringify(route, null, 2)}\nNavio: ${JSON.stringify(vessel, null, 2)}`;
        break;

      case "chat":
      default:
        systemPrompt = `Você é um meteorologista marítimo especializado em weather routing.
Expertise: previsão marítima, routing otimizado, Beaufort scale, sea states, ciclones tropicais, monções.
Responda em português de forma técnica.`;
        break;
    }

    const aiMessages = type === "chat" && messages
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }];

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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    if (type === "chat") {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    let parsed = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch { /* raw text fallback */ }

    return new Response(JSON.stringify({ success: true, result: parsed || content, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Weather Routing error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
