import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "fatigue_analysis":
        systemPrompt = `Você é um especialista em gestão de tripulação marítima e análise de fadiga conforme MLC 2006.
Analise os dados da tripulação e forneça:
1. Avaliação de risco de fadiga individual
2. Recomendações para reorganização de escala
3. Alertas de compliance com regulamentações marítimas
4. Sugestões de descanso otimizado
Responda em português de forma clara e técnica.`;
        userPrompt = `Analise a fadiga desta tripulação:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "competency_analysis":
        systemPrompt = `Você é um especialista em desenvolvimento de competências marítimas e certificações.
Analise os gaps de competência e forneça:
1. Priorização de treinamentos
2. Plano de desenvolvimento individual
3. Cronograma sugerido de capacitação
4. ROI estimado dos treinamentos
Responda em português com foco em resultados práticos.`;
        userPrompt = `Analise os gaps de competência:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "schedule_optimization":
        systemPrompt = `Você é um especialista em otimização de escalas marítimas e gestão de turnos.
Analise a escala atual e forneça:
1. Sugestões de redistribuição de turnos
2. Balanceamento de carga de trabalho
3. Compliance com MLC 2006 (mínimo 10h descanso em 24h)
4. Previsão de impacto na fadiga geral
Responda em português com recomendações específicas.`;
        userPrompt = `Otimize esta escala:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "performance_insights":
        systemPrompt = `Você é um especialista em análise de performance de tripulações marítimas.
Analise os dados de performance e forneça:
1. Identificação de talentos para promoção
2. Áreas de melhoria por tripulante
3. Comparativo com benchmarks do setor
4. Recomendações de desenvolvimento
Responda em português com insights acionáveis.`;
        userPrompt = `Analise a performance da tripulação:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "certification_alerts":
        systemPrompt = `Você é um especialista em certificações marítimas e compliance.
Analise as certificações e forneça:
1. Alertas de vencimento prioritários
2. Impacto operacional de cada certificação
3. Plano de renovação otimizado
4. Custos estimados e fornecedores sugeridos
Responda em português com urgência quando necessário.`;
        userPrompt = `Analise as certificações:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "chat":
      default:
        systemPrompt = `Você é o Copiloto IA especializado em Gestão de Tripulação Marítima.

Você ajuda gestores de RH marítimo com:
- Análise de fadiga e compliance MLC 2006
- Gestão de certificações e treinamentos
- Otimização de escalas de trabalho
- Desenvolvimento de carreira da tripulação
- Planejamento de embarques e desembarques
- Análise de performance e promoções

Conhecimento especializado em:
- Convenção MLC 2006 (Maritime Labour Convention)
- Certificações STCW, HUET, BOSIET, T-BOSIET
- Regulamentações NORMAM, IMO, Marinha do Brasil
- Gestão de tripulações offshore e navegação

Responda em português de forma profissional, técnica e útil.
Seja proativo com sugestões e alertas importantes.`;
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
      console.error("AI gateway error:", response.status, errorText);
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
    console.error("Crew AI Copilot error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
