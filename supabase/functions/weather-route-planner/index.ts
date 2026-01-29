import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "WEATHER-ROUTE-PLANNER";

interface WeatherRoutePlannerRequest {
  type: string;
  data?: Record<string, unknown>;
  messages?: Array<{ role: string; content: string }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, messages } = await req.json() as WeatherRoutePlannerRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "route_weather_analysis":
        systemPrompt = `Você é um especialista em meteorologia marítima e planejamento de rotas.
Analise as condições meteorológicas e forneça:
1. Análise detalhada da rota proposta considerando clima
2. Janelas meteorológicas ideais para navegação
3. Riscos climáticos ao longo da rota
4. Recomendações de alteração de rota se necessário
5. Consumo de combustível estimado por condição climática
Responda em português com dados técnicos precisos.`;
        userPrompt = `Analise rota considerando clima:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "weather_window_prediction":
        systemPrompt = `Você é um especialista em previsão de janelas meteorológicas para operações marítimas.
Analise e forneça:
1. Próximas janelas favoráveis para operações (6h, 12h, 24h, 48h)
2. Probabilidade de condições favoráveis por período
3. Limites operacionais (Beaufort, visibilidade, altura de onda)
4. Recomendação GO/NO-GO para cada janela
5. Plano de contingência para deterioração
Responda em português com probabilidades e métricas.`;
        userPrompt = `Preveja janelas meteorológicas:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "voyage_optimization":
        systemPrompt = `Você é um especialista em otimização de voyage planning marítimo.
Analise e forneça:
1. Rota ótima considerando tempo, combustível e clima
2. Waypoints recomendados com ETA
3. Velocidade econômica por trecho
4. Impacto de correntes e ventos
5. Alternativas de abrigo em caso de mau tempo
Responda em português com dados de navegação precisos.`;
        userPrompt = `Otimize voyage planning:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "port_call_optimization":
        systemPrompt = `Você é um especialista em otimização de port calls e operações portuárias.
Analise e forneça:
1. Melhor janela de chegada considerando clima e maré
2. Tempo estimado de operação no porto
3. Coordenação com previsão meteorológica
4. Riscos de atraso por condições adversas
5. Plano alternativo se janela for perdida
Responda em português com cronograma detalhado.`;
        userPrompt = `Otimize port call:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "fuel_weather_correlation":
        systemPrompt = `Você é um especialista em correlação entre consumo de combustível e condições meteorológicas.
Analise e forneça:
1. Impacto do clima no consumo de bunker
2. Velocidade econômica por condição de mar
3. Projeção de consumo para diferentes cenários
4. Recomendações de trim e lastro
5. Economia potencial com roteamento meteorológico
Responda em português com métricas de consumo.`;
        userPrompt = `Analise correlação clima/combustível:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "chat":
      default:
        systemPrompt = `Você é o Assistente IA de Planejamento de Rotas Meteorológico do Nautilus One.

Você ajuda navegadores e operadores com:
- Análise de condições meteorológicas para navegação
- Planejamento de rotas considerando clima
- Identificação de janelas operacionais
- Otimização de voyage planning
- Previsão de consumo vs condições climáticas

Conhecimento especializado em:
- Meteorologia marítima (GRIB, modelos GFS, ECMWF)
- Escalas de Beaufort e Douglas
- Oceanografia (correntes, marés, ondas)
- Roteamento meteorológico (weather routing)
- Regulamentações SOLAS e MARPOL

Responda em português de forma técnica mas acessível.
Use dados quantitativos (velocidades em nós, alturas em metros, direções em graus).`;
        break;
    }

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
          ...(messages || [{ role: "user", content: userPrompt }]),
        ],
        stream: type === "chat",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      edgeLogger.error(TAG, "AI gateway error", new Error(errorText), { status: response.status });
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "chat") {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    edgeLogger.error(TAG, "Error", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
