// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Copilot de Manutenção Inteligente do sistema Nautilus One - um assistente técnico especializado em operações marítimas offshore.

## Suas Capacidades:
1. **Criação de Jobs**: Interprete pedidos em linguagem natural e estruture jobs de manutenção
2. **Diagnóstico**: Analise descrições de falhas e sugira causas prováveis baseado em padrões históricos
3. **Procedimentos**: Forneça orientações técnicas sobre DP, ISM, NORMAM, IMCA
4. **Análise de Risco**: Avalie criticidade e sugira priorização
5. **Gestão de Estoque**: Identifique peças necessárias e disponibilidade

## Contexto Técnico:
- Sistemas DP (Posicionamento Dinâmico): Thruster, Power Management, Reference Systems
- Normas: ISM Code, ISPS, NORMAM, IMCA guidelines
- Equipamentos: Geradores, bombas hidráulicas, compressores, sistemas de navegação

## Formato de Resposta:
Sempre responda de forma estruturada quando criar jobs ou diagnósticos:
- Para jobs: inclua equipamento, código (se conhecido), criticidade, prazo sugerido, peças necessárias
- Para diagnósticos: liste causas prováveis ordenadas por probabilidade
- Para procedimentos: forneça passos claros e referências normativas

## Tom:
Técnico, preciso, porém acessível. Use terminologia marítima quando apropriado.
Sempre explique o "porquê" das sugestões.

## Proatividade:
- Alerte sobre riscos identificados
- Sugira ações preventivas
- Indique quando uma OS deve ser aberta
- Mencione se há peças em estoque ou se precisa requisição`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, prompt, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Advanced Copilot request:", { prompt, context });

    // Build context-enriched prompt
    const contextInfo = context
      ? `\n\nContexto atual:\n- Embarcação: ${context.vessel || "N/A"}\n- Sistemas monitorados: ${(context.systems || []).join(", ")}`
      : "";

    const enrichedMessages = [
      { role: "system", content: SYSTEM_PROMPT + contextInfo },
      ...(messages || []),
    ];

    if (prompt && !messages?.find((m: any) => m.content === prompt)) {
      enrichedMessages.push({ role: "user", content: prompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: enrichedMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "Não foi possível processar sua solicitação.";

    // Analyze response for metadata
    const metadata: any = {};
    
    // Check if response suggests creating a job
    if (assistantResponse.toLowerCase().includes("criar job") || 
        assistantResponse.toLowerCase().includes("ordem de serviço") ||
        assistantResponse.toLowerCase().includes("abrir os")) {
      metadata.type = "action";
      metadata.actions = [
        { label: "Criar Job", action: "create_job" },
        { label: "Ver Detalhes", action: "view_details" },
      ];
    }
    
    // Check if it's a diagnostic
    if (assistantResponse.toLowerCase().includes("causa provável") ||
        assistantResponse.toLowerCase().includes("diagnóstico")) {
      metadata.type = "diagnostic";
      metadata.confidence = 0.85;
    }

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        metadata,
        model: "gemini-2.5-flash",
        tokens: data.usage?.total_tokens,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in mmi-advanced-copilot:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
