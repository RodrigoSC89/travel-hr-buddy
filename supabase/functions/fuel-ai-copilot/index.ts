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

    const systemPrompt = `Você é um Especialista em Otimização de Combustível Marítimo. Suas responsabilidades incluem:

- Análise de consumo de combustível de embarcações
- Otimização de rotas para economia de combustível
- Recomendações de velocidade ideal
- Análise de impacto de condições meteorológicas no consumo
- Estratégias de economia e sustentabilidade
- Cálculos de custos e projeções de economia
- Análise de eficiência de motores e propulsão

Contexto do Sistema:
${context || "Nenhum contexto adicional disponível."}

Diretrizes:
1. Forneça análises técnicas precisas com dados numéricos
2. Sugira ações práticas e implementáveis
3. Considere fatores ambientais e regulatórios (IMO, MARPOL)
4. Calcule economias potenciais em litros/toneladas e valores monetários
5. Responda em português brasileiro
6. Use formatação markdown para organizar a resposta
7. Destaque métricas importantes em negrito
8. Inclua alertas de segurança quando relevante`;

    console.log("Calling Lovable AI Gateway for fuel optimization...");

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
    console.error("Error in fuel-ai-copilot:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
