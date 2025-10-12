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
    const { content } = await req.json();
    
    if (!content) {
      throw new Error("Content is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing document summarization request");

    const systemPrompt = `Você é um assistente especializado em resumir documentos de forma concisa e eficaz.

    Suas habilidades incluem:
    - Extrair os pontos principais e ideias centrais
    - Criar resumos claros e objetivos
    - Manter a essência e mensagem do documento original
    - Usar linguagem profissional e direta
    - Em português brasileiro

    Ao resumir um documento:
    - Identifique os pontos principais
    - Seja conciso mas completo
    - Mantenha a ordem lógica das ideias
    - Use linguagem clara e objetiva
    - Não adicione informações que não estão no documento original`;

    const requestBody = {
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Resuma o seguinte documento:\n\n${content}` }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    };

    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`API request attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
        
        response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }, REQUEST_TIMEOUT);

        if (response.ok) {
          break;
        }

        const status = response.status;
        lastError = new Error(`HTTP ${status}`);

        if (status === 429 || (status >= 500 && status < 600)) {
          if (attempt < MAX_RETRIES) {
            const delay = getRetryDelay(attempt);
            console.log(`Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw lastError;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === MAX_RETRIES) {
          throw new Error(`OpenAI API failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`);
        }
        
        const delay = getRetryDelay(attempt);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`OpenAI API failed: ${lastError?.message || "Unknown error"}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const summary = data.choices[0].message.content;

    console.log("Generated summary:", summary.substring(0, 100) + "...");

    return new Response(JSON.stringify({ 
      summary,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error summarizing document:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
