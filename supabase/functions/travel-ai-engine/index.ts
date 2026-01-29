import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "TRAVEL-AI-ENGINE";

interface TravelAIRequest {
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
    const { type, data, messages } = await req.json() as TravelAIRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "route_optimization":
        systemPrompt = `Você é um especialista em otimização de rotas de viagem corporativas marítimas.
Analise os dados de viagem e forneça:
1. Rota mais eficiente considerando custo, tempo e emissões de CO2
2. Alternativas de transporte (aéreo, terrestre, marítimo)
3. Análise de economia potencial
4. Recomendações de janelas de embarque ideais
5. Pontos de conexão otimizados
Responda em português com dados quantitativos e justificativas claras.`;
        userPrompt = `Otimize esta rota de viagem:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "cost_prediction":
        systemPrompt = `Você é um especialista em análise preditiva de custos de viagem corporativa marítima.
Analise os dados históricos e forneça:
1. Previsão de custos para próximos 30/60/90 dias
2. Tendências de preços (passagens, hospedagem, transfers)
3. Melhores períodos para compra
4. Alertas de variação de preço
5. Oportunidades de economia em bulk booking
Responda em português com projeções numéricas e confiança estatística.`;
        userPrompt = `Preveja custos para:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "sustainability_analysis":
        systemPrompt = `Você é um especialista em sustentabilidade e ESG para viagens corporativas.
Analise os dados de viagem e forneça:
1. Cálculo de pegada de carbono (kg CO2e) por viagem
2. Comparativo com alternativas mais sustentáveis
3. Certificações e offsets recomendados
4. Score ESG da viagem
5. Metas de redução de emissões
Responda em português com métricas precisas e recomendações acionáveis.`;
        userPrompt = `Analise sustentabilidade:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "logistics_optimization":
        systemPrompt = `Você é um especialista em logística de mobilização/desmobilização de tripulação marítima.
Analise e forneça:
1. Cronograma otimizado de mob/demob
2. Coordenação de múltiplos tripulantes
3. Minimização de overlaps e gaps
4. Otimização de custos de hospedagem
5. Contingências para atrasos
Responda em português com timeline detalhado e recomendações.`;
        userPrompt = `Otimize logística de:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "vendor_recommendation":
        systemPrompt = `Você é um especialista em gestão de fornecedores de viagem corporativa.
Analise e forneça:
1. Ranking de fornecedores (companhias aéreas, hotéis, transfers)
2. Score de confiabilidade baseado em histórico
3. Melhores tarifas corporativas disponíveis
4. Programas de fidelidade recomendados
5. Acordos de SLA sugeridos
Responda em português com análise comparativa detalhada.`;
        userPrompt = `Recomende fornecedores para:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "chat":
      default:
        systemPrompt = `Você é o Assistente IA de Viagens Corporativas Marítimas do Nautilus One.

Você ajuda gestores de viagem com:
- Planejamento de mobilização e desmobilização de tripulação
- Otimização de rotas e custos de viagem
- Gestão de reservas (voos, hotéis, transfers)
- Análise de sustentabilidade e pegada de carbono
- Coordenação logística multi-site

Conhecimento especializado em:
- Rotas de tripulação offshore Brasil (bases: Macaé, Rio, Santos, Vitória)
- Companhias aéreas nacionais e internacionais
- Hotéis corporativos conveniados
- Regulamentações de viagem marítima
- Compliance com políticas de viagem corporativa

Responda em português de forma profissional e proativa.
Sempre forneça dados quantitativos quando possível (custos, tempos, emissões).`;
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
