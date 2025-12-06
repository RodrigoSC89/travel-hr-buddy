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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages, context } = await req.json();

    const systemPrompt = `Você é um Meteorologista Marítimo Especializado. Suas responsabilidades incluem:

- Análise de condições meteorológicas para operações marítimas
- Previsão de tempestades, ventos e ondas
- Recomendações de segurança para navegação
- Interpretação de dados meteorológicos em tempo real
- Alertas de condições adversas
- Planejamento de rotas considerando clima
- Análise de janelas de tempo para operações offshore

Contexto do Sistema:
${context || "Nenhum contexto adicional disponível."}

Diretrizes:
1. Forneça análises técnicas precisas com dados numéricos
2. Priorize a segurança da tripulação e embarcações
3. Use terminologia marítima apropriada (nós, milhas náuticas, hPa)
4. Destaque alertas e avisos importantes
5. Considere o impacto nas operações marítimas
6. Responda em português brasileiro
7. Use formatação markdown para organizar a resposta
8. Inclua escala Beaufort quando relevante
9. Forneça recomendações práticas e acionáveis`;

    console.log("Calling Lovable AI Gateway for weather analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";

    console.log("AI response received successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in weather-ai-copilot:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
