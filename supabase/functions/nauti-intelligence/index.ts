import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Nauti Intelligence - Unified AI Gateway
 * Integrates chatWithAI, predictTrends, detectAnomalies, generateInsights
 */

type AIOperation = "chat" | "predict" | "anomaly" | "insight" | "copilot" | "scenario";

interface RequestPayload {
  operation: AIOperation;
  context?: Record<string, unknown>;
  messages?: Array<{ role: string; content: string }>;
  data?: Record<string, unknown>;
  options?: {
    stream?: boolean;
    temperature?: number;
    maxTokens?: number;
  };
}

const SYSTEM_PROMPTS: Record<AIOperation, string> = {
  chat: `Você é o Nauti AI, assistente especializado em operações marítimas. 
Você ajuda com gestão de frotas, tripulação, manutenção, compliance (ISM, MLC, STCW), ESG e operações.
Responda sempre em português do Brasil, de forma clara e profissional.
Forneça insights acionáveis e específicos para o contexto marítimo.`,

  predict: `Você é um analista preditivo especializado em operações marítimas.
Analise os dados fornecidos e gere previsões para os próximos 7, 30 e 90 dias.
Inclua:
- Tendências identificadas
- Riscos potenciais
- Recomendações de ação
- Nível de confiança (0-100%)
Responda em formato JSON estruturado.`,

  anomaly: `Você é um detector de anomalias para sistemas marítimos.
Analise os dados e identifique:
- Valores fora do padrão esperado
- Comportamentos incomuns
- Possíveis falhas ou riscos
- Severidade (crítico, alto, médio, baixo)
Responda em formato JSON com lista de anomalias detectadas.`,

  insight: `Você é um gerador de insights estratégicos para operações marítimas.
Com base nos dados fornecidos, gere insights acionáveis incluindo:
- Título do insight
- Descrição detalhada
- Impacto estimado
- Ações recomendadas
- Prioridade (1-5)
Responda em formato JSON com array de insights.`,

  copilot: `Você é o Co-Pilot do Nautilus One, um assistente proativo que:
- Orienta o usuário em cada seção do sistema
- Sugere ações baseadas no contexto atual
- Antecipa necessidades com base no histórico
- Fornece atalhos e dicas relevantes
Seja conciso, proativo e sempre útil.`,

  scenario: `Você é um simulador de cenários operacionais marítimos.
Dado um cenário hipotético, analise:
- Impacto operacional
- Impacto financeiro
- Riscos associados
- Mitigações possíveis
- Probabilidade de sucesso
Forneça análise detalhada com gráficos sugeridos e métricas.`,
};

async function callLovableAI(
  operation: AIOperation,
  messages: Array<{ role: string; content: string }>,
  context: Record<string, unknown> = {},
  stream = false
): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = SYSTEM_PROMPTS[operation];
  const contextStr = Object.keys(context).length > 0 
    ? `\n\nContexto atual:\n${JSON.stringify(context, null, 2)}` 
    : "";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt + contextStr },
        ...messages,
      ],
      stream,
      temperature: operation === "predict" || operation === "anomaly" ? 0.3 : 0.7,
    }),
  });

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { operation, context = {}, messages = [], data = {}, options = {} } = payload;

    if (!operation) {
      return new Response(
        JSON.stringify({ error: "Operation is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build messages based on operation type
    let aiMessages = messages;

    if (operation !== "chat" && Object.keys(data).length > 0) {
      aiMessages = [
        { role: "user", content: `Analise os seguintes dados:\n\n${JSON.stringify(data, null, 2)}` },
        ...messages,
      ];
    }

    if (aiMessages.length === 0) {
      aiMessages = [{ role: "user", content: "Forneça uma análise geral do sistema." }];
    }

    const response = await callLovableAI(operation, aiMessages, context, options.stream);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream response
    if (options.stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Try to parse as JSON for structured operations
    if (["predict", "anomaly", "insight", "scenario"].includes(operation)) {
      try {
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                          content.match(/\{[\s\S]*\}/) ||
                          content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          return new Response(
            JSON.stringify({ success: true, operation, data: parsed }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch {
        // Return as text if JSON parsing fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, operation, content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("nautilus-intelligence error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
