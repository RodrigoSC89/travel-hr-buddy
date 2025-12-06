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
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages, context, type } = await req.json();

    console.log("Optimization AI Copilot request:", { type, messagesCount: messages?.length });

    const systemPrompt = `Você é um Especialista em Otimização de Sistemas Marítimos e Performance Empresarial. Suas especialidades incluem:

## Áreas de Expertise:

### 1. Performance de Sistemas
- Análise de métricas de CPU, memória, rede e banco de dados
- Identificação de gargalos e bottlenecks
- Recomendações de otimização de infraestrutura
- Cache strategies e query optimization
- Lazy loading e code splitting

### 2. Experiência do Usuário (UX)
- Análise de jornada do usuário
- Identificação de pain points
- Taxa de conclusão de tarefas
- Otimização de formulários e fluxos
- Acessibilidade e responsividade

### 3. Otimização Operacional Marítima
- Eficiência de rotas marítimas
- Otimização de consumo de combustível
- Gestão de tripulação e escalas
- Manutenção preventiva vs corretiva
- Compliance regulatório (IMO, MARPOL)

### 4. Insights e Previsões
- Análise preditiva de tendências
- ROI de melhorias implementadas
- Benchmarking de performance
- KPIs e métricas de sucesso

## Contexto do Sistema:
${context || "Nenhum contexto adicional disponível."}

## Diretrizes de Resposta:
1. Forneça análises técnicas precisas com métricas e números
2. Priorize recomendações por impacto e facilidade de implementação
3. Calcule ROI estimado quando possível
4. Use formatação markdown para organizar respostas
5. Destaque métricas críticas em **negrito**
6. Inclua alertas de performance quando relevante
7. Sugira quick wins e melhorias de longo prazo
8. Responda sempre em português brasileiro`;

    console.log("Calling Lovable AI Gateway for optimization analysis...");

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
      const status = response.status;
      const errorText = await response.text();
      console.error("AI Gateway error:", status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";

    console.log("Optimization AI response received successfully");

    return new Response(
      JSON.stringify({ response: aiResponse, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in optimization-ai-copilot:", error);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
