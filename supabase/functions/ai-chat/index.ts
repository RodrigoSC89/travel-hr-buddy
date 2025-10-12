import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  callOpenAIWithRetry,
  logAIInteraction,
  extractTokenUsage,
  validateOpenAIResponse,
} from "../_shared/ai-utils.ts";
import { createSupabaseClient, getAuthenticatedUser } from "../_shared/supabase-client.ts";

interface AIChatRequest {
  message: string;
  context?: string;
  module?: string;
  conversation_history?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let supabaseClient: any = null;
  let userId: string | undefined = undefined;
  let requestData: AIChatRequest | null = null;

  try {
    // Initialize Supabase client
    supabaseClient = createSupabaseClient(req);
    const user = await getAuthenticatedUser(supabaseClient);
    userId = user?.id;

    requestData = await req.json();
    const { message, context, module, conversation_history } = requestData;

    if (!message) {
      await logAIInteraction(supabaseClient, {
        user_id: userId,
        interaction_type: "chat",
        prompt: "",
        success: false,
        error_message: "Message is required",
        duration_ms: Date.now() - startTime,
        metadata: { context, module },
      });

      throw new Error("Message is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing chat request:", message);

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

    // Build messages array with conversation history
    const messages = [{ role: "system", content: systemPrompt }];

    // Add conversation history if provided (last 5 messages)
    if (conversation_history && conversation_history.length > 0) {
      messages.push(...conversation_history.slice(-5));
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const requestBody = {
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    };

    // Call OpenAI with retry logic
    const { response: data, duration } = await callOpenAIWithRetry(OPENAI_API_KEY, requestBody);

    // Validate response format
    if (!validateOpenAIResponse(data)) {
      throw new Error("Invalid response format from OpenAI API");
    }

    const reply = (data as any).choices[0].message.content;

    console.log("Generated response:", reply.substring(0, 100) + "...");

    // Log successful interaction
    await logAIInteraction(supabaseClient, {
      user_id: userId,
      interaction_type: "chat",
      prompt: message,
      response: reply,
      model_used: "gpt-4o-mini",
      tokens_used: extractTokenUsage(data),
      duration_ms: duration,
      success: true,
      metadata: {
        context,
        module,
        conversation_length: conversation_history?.length || 0,
      },
    });

    return new Response(
      JSON.stringify({
        reply,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);

    // Log failed interaction
    if (supabaseClient && requestData) {
      await logAIInteraction(supabaseClient, {
        user_id: userId,
        interaction_type: "chat",
        prompt: requestData?.message || "",
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
        duration_ms: Date.now() - startTime,
        metadata: {
          context: requestData?.context,
          module: requestData?.module,
        },
      });
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});