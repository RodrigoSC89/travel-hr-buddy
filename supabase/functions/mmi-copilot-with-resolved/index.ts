import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResolvedAction {
  acao_realizada: string;
  duracao_execucao: string;
  efetiva: boolean;
  observacoes?: string;
}

async function fetchResolvedActions(
  supabaseUrl: string,
  supabaseKey: string,
  authHeader: string | null,
  componente: string
): Promise<ResolvedAction[]> {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });

  const { data, error } = await supabase
    .from("mmi_os_ia_feed")
    .select("acao_realizada, duracao_execucao, efetiva, observacoes")
    .eq("componente", componente)
    .eq("efetiva", true)
    .order("data_execucao", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching resolved actions:", error);
    return [];
  }

  return data || [];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, componente } = await req.json();

    if (!prompt || !componente) {
      throw new Error("Both 'prompt' and 'componente' are required");
    }

    console.log("MMI Copilot request:", { prompt, componente });

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Get Supabase configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    // Fetch historical resolved actions for this component
    const resolved = await fetchResolvedActions(
      supabaseUrl,
      supabaseKey,
      authHeader,
      componente
    );

    console.log(`Found ${resolved.length} effective actions for component: ${componente}`);

    // Build historical context block
    const historicBlock = resolved.length
      ? `Ações anteriores eficazes neste componente:\n${resolved
          .map(
            (r, i) =>
              `Caso ${i + 1}: ${r.acao_realizada} — Duração: ${r.duracao_execucao}, Efetiva: ${r.efetiva}${
                r.observacoes ? ` — Obs: ${r.observacoes}` : ""
              }`
          )
          .join("\n")}`
      : "Nenhum histórico eficaz encontrado para este componente.";

    // Enrich the prompt with historical context
    const enrichedPrompt = `Você é um engenheiro técnico marítimo.\n\nJob atual: ${prompt}\nComponente: ${componente}\n\n${historicBlock}\n\nSugira a melhor ação técnica, com justificativa e prazo.`;

    console.log("Enriched prompt created with historical context");

    // Call OpenAI API with streaming
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        stream: true,
        messages: [
          {
            role: "system",
            content: "Você é um engenheiro técnico de manutenção com acesso a histórico de OS.",
          },
          {
            role: "user",
            content: enrichedPrompt,
          },
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    // Stream the OpenAI response back to the client
    const stream = openAIResponse.body;
    
    if (!stream) {
      throw new Error("No response stream from OpenAI");
    }

    console.log("Streaming response to client");

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in mmi-copilot-with-resolved function:", error);
    
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
