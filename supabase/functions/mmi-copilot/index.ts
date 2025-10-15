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
    const { prompt } = await req.json();
    
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

    console.log("Processing MMI Copilot request:", prompt);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Generate embedding for the user's query
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: prompt,
        model: "text-embedding-ada-002"
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error("OpenAI Embedding API error:", errorText);
      throw new Error(`Failed to generate embedding: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log("Generated embedding, searching for similar jobs...");

    // Step 2: Search for similar historical jobs using vector similarity
    const { data: similarJobs, error: matchError } = await supabase.rpc('match_mmi_jobs', {
      query_embedding: embedding,
      match_threshold: 0.78,
      match_count: 3
    });

    if (matchError) {
      console.error("Error matching jobs:", matchError);
      throw new Error(`Failed to match similar jobs: ${matchError.message}`);
    }

    console.log(`Found ${similarJobs?.length || 0} similar jobs`);

    // Step 3: Build enriched prompt with historical context
    const historicalContext = similarJobs && similarJobs.length > 0
      ? similarJobs
          .map((job, i) => 
            `Caso ${i + 1}: ${job.title} — ${job.description?.slice(0, 200) || 'Sem descrição'}...`
          )
          .join('\n')
      : "Nenhum caso histórico similar encontrado.";

    const enrichedPrompt = `
Você é um assistente técnico de manutenção marítima.
Baseado na descrição: "${prompt}", considere os seguintes casos históricos semelhantes:
${historicalContext}

Sugira uma ação técnica precisa, cite o componente, prazo e se há recomendação de OS ou não.`;

    // Step 4: Stream AI response using OpenAI chat completions
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
            content: "Você é um engenheiro técnico embarcado, especialista em manutenção, com foco em sistemas críticos e históricos de falhas."
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

    // Step 5: Stream the response back to the client
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
    console.error("Error in mmi-copilot function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
