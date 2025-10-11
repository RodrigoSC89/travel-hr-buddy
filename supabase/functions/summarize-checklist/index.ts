import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Exponential backoff with jitter
const getRetryDelay = (attempt: number): number => {
  const exponentialDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return exponentialDelay + jitter;
};

// Check if error is retryable
const isRetryableError = (status?: number): boolean => {
  // Retry on 429 (rate limit), 500s (server errors), and 503 (service unavailable)
  return status === 429 || (status !== undefined && status >= 500 && status < 600);
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
    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body
    const { title, items, comments } = await req.json();

    // Validate items
    if (!items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: "Formato inválido de itens" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    console.log("Processing checklist summary request for:", title);

    // Build text representation of checklist
    const text = `
Checklist: ${title || "Sem título"}

Itens:
${items.map((i: any) => `- [${i.checked || i.completed ? "X" : " "}] ${i.title}`).join("\n")}

Comentários:
${comments?.map((c: any) => `• ${c.user}: ${c.text}`).join("\n") || "Nenhum"}
    `;

    // Prepare OpenAI request
    const requestBody = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que analisa checklists. Primeiro, gere um resumo conciso com status geral. Depois, liste até 3 sugestões de melhoria, baseadas nos comentários ou progresso. Seja objetivo."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.5,
    };

    // Retry logic with exponential backoff
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
          break; // Success, exit retry loop
        }

        // Check if we should retry
        if (!isRetryableError(response.status)) {
          const errorText = await response.text();
          console.error("OpenAI API non-retryable error:", errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        lastError = new Error(`HTTP ${response.status}`);
        
        // Wait before retrying (except on last attempt)
        if (attempt < MAX_RETRIES) {
          const delay = getRetryDelay(attempt);
          console.log(`Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on timeout or network errors on last attempt
        if (attempt === MAX_RETRIES) {
          throw new Error(`OpenAI API failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`);
        }
        
        // Wait before retrying
        const delay = getRetryDelay(attempt);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`OpenAI API failed: ${lastError?.message || "Unknown error"}`);
    }

    // Parse OpenAI response
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const result = data.choices[0].message.content;

    console.log("Generated summary:", result.substring(0, 100) + "...");

    // Return successful response
    return new Response(
      JSON.stringify({ 
        summary: result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (err) {
    console.error("Erro na IA de resumo:", err);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao gerar resumo",
        details: err instanceof Error ? err.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
