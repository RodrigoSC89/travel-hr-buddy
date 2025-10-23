// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Lovable AI API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get system status for context
    const systemContext = context || {};

    const systemPrompt = `Você é o Nautilus Command AI, o assistente inteligente central do sistema Nautilus One.

Você tem acesso a informações sobre:
- Módulos do sistema e seu status
- Logs e eventos recentes
- Métricas de performance
- Alertas e recomendações
- Comandos e workflows disponíveis

Suas capacidades incluem:
1. Responder perguntas sobre o sistema
2. Sugerir ações e otimizações
3. Analisar problemas e propor soluções
4. Executar comandos quando autorizado
5. Gerar relatórios e análises

Contexto atual do sistema:
${JSON.stringify(systemContext, null, 2)}

Seja conciso, técnico e acionável. Sempre indique quando uma ação requer confirmação do usuário.`;

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
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Store conversation in database
    const userId = req.headers.get("x-user-id");
    if (userId) {
      await supabase.from("nautilus_conversations").insert({
        user_id: userId,
        messages: messages,
        context: systemContext,
        timestamp: new Date().toISOString(),
      }).catch(err => console.error("Error storing conversation:", err));
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error in nautilus command:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
