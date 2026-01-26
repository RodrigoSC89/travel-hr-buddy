import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "AI-CHAT";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, messages } = await req.json();
    
    if (!message && (!messages || messages.length === 0)) {
      throw new Error("Message is required");
    }

    // Usar Lovable AI Gateway (preferencial) ou OpenAI como fallback
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
      throw new Error("No AI API key configured");
    }

    const apiUrl = LOVABLE_API_KEY 
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    
    const apiKey = LOVABLE_API_KEY || OPENAI_API_KEY;
    const model = LOVABLE_API_KEY ? "google/gemini-2.5-flash" : "gpt-4o-mini";

    edgeLogger.info(TAG, `Processing request`, { model });

    const systemPrompt = `Você é um assistente corporativo inteligente chamado Nautilus Assistant. 

    Você pode ajudar com:
    - Análise de dados e geração de relatórios
    - Dúvidas sobre o sistema e navegação
    - Informações sobre certificados e compliance
    - Reservas e viagens corporativas
    - Alertas de preços e monitoramento
    - Gestão de recursos humanos
    - Análises de desempenho e métricas

    Características:
    - Seja sempre profissional, útil e direto
    - Responda em português brasileiro
    - Forneça informações precisas e acionáveis
    - Se não souber algo específico, seja honesto
    - Sugira próximos passos quando apropriado

    ${context ? `Contexto adicional: ${context}` : ""}`;

    // Support both single message and array of messages
    const chatMessages = messages || [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    // Ensure system prompt is included if using messages array
    if (messages && !messages.some((m: {role: string}) => m.role === "system")) {
      chatMessages.unshift({ role: "system", content: systemPrompt });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    // Tratar rate limits e erros de pagamento
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }),
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

    edgeLogger.success(TAG, `Response generated`, { length: reply.length });

    return new Response(JSON.stringify({ 
      reply,
      timestamp: new Date().toISOString(),
      model
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
