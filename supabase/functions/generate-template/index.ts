import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;
const REQUEST_TIMEOUT = 30000;

// Exponential backoff with jitter
const getRetryDelay = (attempt: number): number => {
  const exponentialDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return exponentialDelay + jitter;
};

// Timeout wrapper for fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, purpose } = await req.json();
    
    if (!title || !purpose) {
      throw new Error("Title and purpose are required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing template generation request:", { title, purpose });

    const systemPrompt = `Você é um especialista em criar templates profissionais para documentos técnicos marítimos e corporativos.

    Suas habilidades incluem:
    - Criar templates estruturados e reutilizáveis
    - Incluir campos de preenchimento variáveis marcados como [NOME_CAMPO]
    - Usar linguagem formal e técnica apropriada
    - Estruturar templates com seções claras e organizadas
    - Adaptar o tom e estilo ao contexto marítimo/corporativo

    Características dos seus templates:
    - Linguagem profissional e técnica
    - Estrutura clara com seções bem definidas
    - Campos variáveis entre colchetes [CAMPO] para preenchimento posterior
    - Formatação apropriada e consistente
    - Em português brasileiro
    - Específicos para o setor marítimo quando aplicável

    Ao gerar um template, inclua:
    - Título e seções apropriadas
    - Campos de preenchimento variáveis como [NOME_TÉCNICO], [DATA], [EMBARCAÇÃO], etc.
    - Estrutura lógica e fácil de seguir
    - Espaços para observações e conclusões
    - Formatação clara e profissional`;

    const userPrompt = `Crie um template com o título "${title}" para o seguinte propósito: ${purpose}
    
    O template deve incluir campos variáveis entre colchetes para preenchimento posterior, como [NOME], [DATA], [LOCAL], etc.
    Mantenha um formato profissional e estruturado.`;

    let lastError: Error | null = null;
    
    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1} of ${MAX_RETRIES}`);
        
        const response = await fetchWithTimeout(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          },
          REQUEST_TIMEOUT
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        console.log("Template generated successfully");

        return new Response(
          JSON.stringify({ content }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on the last attempt
        if (attempt < MAX_RETRIES - 1) {
          const delay = getRetryDelay(attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed
    throw lastError || new Error("Failed to generate template after retries");

  } catch (error) {
    console.error("Error in generate-template function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
