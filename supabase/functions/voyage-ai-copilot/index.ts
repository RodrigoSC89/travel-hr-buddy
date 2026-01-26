import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "VOYAGE-AI-COPILOT";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages, context } = await req.json();

    edgeLogger.info(TAG, "Processing request", { messagesCount: messages?.length });

    const systemPrompt = `Você é um Copiloto de Viagem Marítima especializado em:
- Otimização de rotas marítimas
- Análise de condições meteorológicas
- Cálculo de ETA (Tempo Estimado de Chegada)
- Eficiência de combustível
- Planejamento logístico portuário

Você tem acesso ao seguinte contexto do sistema:
${context || "Nenhum contexto adicional disponível."}

Diretrizes:
1. Sempre forneça respostas práticas e acionáveis
2. Use dados numéricos quando disponíveis
3. Destaque riscos e alertas importantes
4. Sugira otimizações sempre que possível
5. Responda em português brasileiro
6. Use formatação markdown para organizar a resposta
7. Seja conciso mas completo`;

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
      edgeLogger.error(TAG, "AI Gateway error", new Error(errorText), { status: response.status });
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";

    edgeLogger.success(TAG, "Response generated");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    edgeLogger.error(TAG, "Error", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
