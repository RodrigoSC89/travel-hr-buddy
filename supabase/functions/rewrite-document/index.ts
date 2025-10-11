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

    console.log("Processing document rewrite request");

    const systemPrompt = `Você é um assistente especializado em reformular e melhorar documentos profissionais.

    Suas habilidades incluem:
    - Manter o significado e intenção do texto original
    - Melhorar a clareza e fluidez da escrita
    - Aprimorar a estrutura e organização do texto
    - Corrigir eventuais problemas de gramática ou estilo
    - Usar linguagem profissional e adequada ao contexto
    
    Instruções:
    - Reformule o documento mantendo todas as informações importantes
    - Melhore a estrutura e clareza
    - Mantenha o tom profissional
    - Preserve o comprimento aproximado do documento original
    - Em português brasileiro`;

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Reformule e melhore o seguinte documento:\n\n${content}` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
    
    const rewritten = data.choices[0].message.content;

    console.log("Generated rewrite:", rewritten.substring(0, 100) + "...");

    return new Response(JSON.stringify({ 
      rewritten,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error rewriting document:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
