import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, componente } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not set");
    }

    console.log("Processing MMI Copilot with Resolved Actions:", { prompt, componente });

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Query historical resolved actions for the component
    let historicalActions = [];
    if (componente) {
      const { data, error } = await supabase
        .from('mmi_os_ia_feed')
        .select('*')
        .eq('componente', componente)
        .eq('efetiva', true)
        .order('resolvido_em', { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching historical actions:", error);
      } else {
        historicalActions = data || [];
      }
    }

    console.log(`Found ${historicalActions.length} historical effective actions for component: ${componente || 'N/A'}`);

    // Step 2: Build enriched prompt with historical context
    const historicalContext = historicalActions.length > 0
      ? historicalActions
          .map((action, i) => {
            const parts = [];
            parts.push(`Ação Histórica ${i + 1}:`);
            if (action.descricao_tecnica) parts.push(`  Descrição: ${action.descricao_tecnica}`);
            if (action.acao_realizada) parts.push(`  Ação Realizada: ${action.acao_realizada}`);
            if (action.causa_confirmada) parts.push(`  Causa: ${action.causa_confirmada}`);
            if (action.duracao_execucao) parts.push(`  Duração: ${action.duracao_execucao}`);
            return parts.join('\n');
          })
          .join('\n\n')
      : "Nenhuma ação histórica efetiva encontrada para este componente.";

    const systemPrompt = `Você é um engenheiro técnico embarcado, especialista em manutenção marítima, com foco em sistemas críticos e históricos de falhas.
Você deve fornecer recomendações práticas e específicas baseadas em experiências anteriores bem-sucedidas.`;

    const enrichedPrompt = `
Contexto: ${componente ? `Manutenção do componente "${componente}"` : 'Análise de manutenção'}

Descrição do problema: "${prompt}"

${historicalContext}

Com base nas informações acima e nos casos históricos efetivos, forneça uma recomendação técnica precisa que inclua:
1. Componente específico (se não fornecido)
2. Ação recomendada baseada em experiências efetivas anteriores
3. Prazo estimado de execução
4. Se é necessário abrir uma OS (Ordem de Serviço)
5. Precauções importantes

Seja objetivo e baseie-se principalmente nas ações que foram efetivas no passado.`;

    // Step 3: Stream AI response using OpenAI chat completions
    const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: systemPrompt
          },
          {
            role: "user",
            content: enrichedPrompt
          }
        ]
      }),
    });

    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      console.error("OpenAI Chat API error:", errorText);
      throw new Error(`OpenAI API error: ${completionResponse.status}`);
    }

    // Step 4: Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = completionResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              const message = line.replace(/^data: /, '');
              if (message === '[DONE]') {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(message);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch (e) {
                // Skip invalid JSON lines
                console.log("Skipping invalid JSON:", message);
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      }
    });

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
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
