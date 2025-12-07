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
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "maintenance":
        systemPrompt = `Você é um especialista em manutenção preditiva de embarcações marítimas. Analise os dados fornecidos e retorne predições estruturadas.`;
        userPrompt = `Analise os seguintes dados de manutenção e equipamentos:
${JSON.stringify(data, null, 2)}

Forneça predições sobre:
1. Probabilidade de falha nos próximos 30 dias
2. Componentes que precisam de atenção
3. Recomendações de manutenção preventiva`;
        break;

      case "inventory":
        systemPrompt = `Você é um especialista em gestão de estoque e procurement marítimo. Analise os dados e forneça recomendações de reposição.`;
        userPrompt = `Analise os seguintes dados de estoque:
${JSON.stringify(data, null, 2)}

Forneça:
1. Itens com risco de ruptura
2. Sugestões de quantidades para pedido
3. Fornecedores recomendados
4. Lead time estimado`;
        break;

      case "route":
        systemPrompt = `Você é um especialista em otimização de rotas marítimas. Considere consumo de combustível, condições climáticas e eficiência.`;
        userPrompt = `Analise os seguintes dados de rota:
${JSON.stringify(data, null, 2)}

Forneça:
1. Rota otimizada sugerida
2. Economia estimada de combustível
3. Riscos identificados
4. Tempo estimado de viagem`;
        break;

      case "compliance":
        systemPrompt = `Você é um especialista em compliance marítimo (SOLAS, ISM, ISPS, MLC). Analise certificados e conformidade.`;
        userPrompt = `Analise os seguintes dados de compliance:
${JSON.stringify(data, null, 2)}

Forneça:
1. Certificados próximos do vencimento
2. Não-conformidades identificadas
3. Ações corretivas recomendadas
4. Priorização por criticidade`;
        break;

      default:
        throw new Error(`Tipo de predição não suportado: ${type}`);
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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_predictions",
              description: "Retorna predições estruturadas",
              parameters: {
                type: "object",
                properties: {
                  predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        probability: { type: "number" },
                        recommendedAction: { type: "string" },
                        deadline: { type: "string" },
                        impact: { type: "string" }
                      },
                      required: ["title", "description", "severity", "recommendedAction"]
                    }
                  },
                  summary: { type: "string" },
                  overallRisk: { type: "string", enum: ["low", "medium", "high", "critical"] }
                },
                required: ["predictions", "summary", "overallRisk"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_predictions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const predictions = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(predictions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "No predictions generated" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Nautilus Predict error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
