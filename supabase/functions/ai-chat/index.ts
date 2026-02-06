import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { edgeLogger } from "../_shared/edge-logger.ts";
import { createClient } from "@supabase/supabase-js";

const TAG = "AI-CHAT";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { message, context, messages, stream = false, agentId } = await req.json();
    
    if (!message && (!messages || messages.length === 0)) {
      throw new Error("Message is required");
    }

    // Usar Lovable AI Gateway (preferencial)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const model = "google/gemini-3-flash-preview";

    edgeLogger.info(TAG, `Processing request`, { model, agentId, stream });

    // System prompt por agente
    const agentPrompts: Record<string, string> = {
      'nauti-brain': `Você é o Nauti Brain, o cérebro central de inteligência do Nautilus One - um sistema de gestão marítima corporativa.
        
Suas capacidades:
- Análise operacional de frotas e embarcações
- Insights sobre compliance (ISM, ISPS, MLC 2006, MARPOL)
- Métricas de desempenho e KPIs marítimos
- Recomendações de manutenção preditiva
- Análise de eficiência de combustível e emissões (CII, EEOI)
- Gestão de tripulação e certificações STCW

Diretrizes:
- Seja preciso e baseado em dados reais quando disponíveis
- Cite regulamentos específicos quando aplicável
- Forneça recomendações acionáveis
- Responda em português brasileiro`,

      'mlc-assistant': `Você é o MLC Assistant, especialista em Maritime Labour Convention 2006.
        
Expertise:
- Todos os 5 Títulos da MLC 2006
- Regulamento 1.1-5.3 completos
- Diretrizes B1.1-B5.3
- Apêndices A1-A5 (certificação)
- Emendas de 2014, 2016, 2018, 2022

Quando questionado sobre compliance:
- Cite o Título/Regulamento específico
- Explique requisitos mínimos
- Mencione práticas recomendadas
- Alerte sobre não-conformidades comuns`,

      'safety-officer': `Você é o Safety Officer AI, responsável por compliance e segurança marítima.
        
Domínios:
- ISM Code (International Safety Management)
- ISPS Code (Ship Security)
- SOLAS (Safety of Life at Sea)
- MARPOL 73/78 (Poluição marinha)
- PEOTRAM (13 Elementos da Petrobras)
- PEO-DP (NORMAM-101/IMCA)

Abordagem:
- Identifique riscos e gaps de compliance
- Sugira ações corretivas prioritárias
- Referencie normas específicas
- Foque em prevenção`,

      default: `Você é o Nautilus Assistant, um assistente corporativo inteligente para gestão marítima.

Suas capacidades:
- Análise de dados e relatórios operacionais
- Suporte a navegação no sistema
- Informações sobre certificados e compliance
- Gestão de tripulação e RH marítimo
- Análises de desempenho e métricas
- Suporte a operações de frota

Características:
- Profissional, útil e direto
- Responda em português brasileiro
- Forneça informações precisas e acionáveis
- Sugira próximos passos quando apropriado`
    };

    const systemPrompt = agentPrompts[agentId || 'default'] || agentPrompts.default;
    const fullSystemPrompt = context 
      ? `${systemPrompt}\n\nContexto adicional: ${context}` 
      : systemPrompt;

    // Support both single message and array of messages
    const chatMessages = messages || [
      { role: "system", content: fullSystemPrompt },
      { role: "user", content: message }
    ];

    // Ensure system prompt is included if using messages array
    if (messages && !messages.some((m: {role: string}) => m.role === "system")) {
      chatMessages.unshift({ role: "system", content: fullSystemPrompt });
    }

    // Streaming response
    if (stream) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Recarregue seu plano." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        edgeLogger.error(TAG, "AI API streaming error", { status: response.status, error: errorText });
        throw new Error(`AI API error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    // Handle rate limits and payment errors
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit excedido. Aguarde alguns segundos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados. Recarregue seu plano." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      edgeLogger.error(TAG, "AI API error", { status: response.status, error: errorText });
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from AI API");
    }
    
    const reply = data.choices[0].message.content;
    const responseTime = Date.now() - startTime;

    edgeLogger.success(TAG, `Response generated`, { 
      length: reply.length, 
      responseTimeMs: responseTime,
      model,
      agentId 
    });

    // Log to ai_audit_logs if Supabase is available
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('ai_audit_logs').insert({
          user_input: message || (messages?.[messages.length - 1]?.content || ''),
          ai_response: reply.substring(0, 5000),
          module_name: agentId || 'ai-chat',
          interaction_type: 'chat',
          model_version: model,
          response_time_ms: responseTime,
          tokens_input: data.usage?.prompt_tokens || 0,
          tokens_output: data.usage?.completion_tokens || 0,
        });
      }
    } catch (logError) {
      edgeLogger.warn(TAG, "Failed to log to ai_audit_logs", { error: logError });
    }

    return new Response(JSON.stringify({ 
      reply,
      timestamp: new Date().toISOString(),
      model,
      agentId,
      responseTimeMs: responseTime,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    edgeLogger.error(TAG, "Error in ai-chat function", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
